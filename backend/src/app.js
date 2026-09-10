import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import routes from './routes/index.js';
import logger from './utils/logger.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.use('/api/v1', routes);

app.use((req, res) => {
  res.status(404).json({ error: { message: 'Not found', code: 'NOT_FOUND' } });
});

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
    },
  });
});

export default app;
