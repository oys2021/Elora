// app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import passport from 'passport';
import routes from './routes/index.js';
import authRoutes from './routes/auth.routes.js';
import logger from './utils/logger.js';
import './config/passport.js'; // session (de)serialisation for password login

const PgSession = connectPgSimple(session);
const sessionPool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const app = express();

// Core middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(compression());
app.use(cookieParser());
// Keep the exact bytes too: the Paystack webhook's signature is computed over
// the raw body, and re-serialising the parsed JSON wouldn't match it.
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
// Only failed requests are logged, as one short line (no headers/cookies).
app.use(
  pinoHttp({
    logger,
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'silent';
    },
    serializers: {
      req: (req) => ({ method: req.method, url: req.url }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  })
);

// Session + Passport (must come before any route that uses req.user)
app.use(
  session({
    store: new PgSession({ pool: sessionPool, tableName: 'user_sessions', createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days — survives closing the browser, not just page reloads
      secure: false, // set true once this runs behind HTTPS
      sameSite: 'lax',
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// API routes
app.use('/api/v1', routes);

// Username / email + password auth (POST /auth/register, POST /auth/login)
app.use('/auth', authRoutes);

app.get('/auth/logout', (req, res) => {
  req.logout(() => res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173'));
});

app.get('/auth/user', (req, res) => {
  res.json(req.user || null);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: { message: 'Not found', code: 'NOT_FOUND' } });
});

// Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    req.log.error({ err }, err.message);
  } else {
    req.log.warn({ err }, err.message);
  }

  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal server error',
      code: err.code || 'INTERNAL_ERROR',
      ...(err.details && { details: err.details }),
    },
  });
});

export default app;