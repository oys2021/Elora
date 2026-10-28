import { Sequelize } from 'sequelize';
import config from './config.cjs';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    ...dbConfig,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    // SQL is noisy; set LOG_SQL=true in .env to see every query while debugging.
    logging: process.env.LOG_SQL === 'true' ? console.log : false,
  },
);

export default sequelize;
