import pino from 'pino';

const env = process.env.NODE_ENV || 'development';

const logger = pino({
  level: process.env.LOG_LEVEL || (env === 'production' ? 'info' : 'debug'),
  transport:
    env === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});

export default logger;
