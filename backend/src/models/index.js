import { sequelize } from '../config/database.js';
import defineUser from './user.model.js';

const models = {
  User: defineUser(sequelize),
};

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

export const { User } = models;
export { sequelize };
export default { sequelize, ...models };
