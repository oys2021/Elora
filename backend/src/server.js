import 'dotenv/config';
import app from './app.js';
import { sequelize } from './config/database.js';
import logger from './utils/logger.js';

const port = process.env.PORT || 3000;

async function start() {
  await sequelize.authenticate();
  logger.info('Database connection established');

  app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  });
}

start().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});
