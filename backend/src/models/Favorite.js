import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Favorite extends Model {}

Favorite.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Favorite',
    tableName: 'favorites',
  }
);

export default Favorite;
