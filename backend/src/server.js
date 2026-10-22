import 'dotenv/config';
import app from './app.js';
import { sequelize } from './config/database.js';
import logger from './utils/logger.js';

const port = process.env.PORT || 8000;

async function start() {
  await sequelize.authenticate();
  logger.info('Database connection established');

  // Express 5 passes listen errors (e.g. EADDRINUSE) to this callback instead of throwing
  app.listen(port, (err) => {
    if (err) {
      logger.fatal({ err }, `Could not listen on port ${port}`);
      process.exit(1);
    }
    logger.info(`Server listening on port ${port}`);
  });
}

start().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});
