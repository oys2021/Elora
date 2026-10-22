import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Banner extends Model {}

Banner.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    linkUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Banner',
    tableName: 'banners',
  }
);

export default Banner;
