import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Product extends Model {}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    zohoItemId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    imageUrls: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isBestseller: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // Manual admin override: true forces the product to show as out of stock
    // regardless of what its variants' stockQuantity says.
    isOutOfStock: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    syncStatus: {
      type: DataTypes.ENUM('PENDING', 'PROCESSING', 'SYNCED', 'FAILED'),
      defaultValue: 'PENDING',
    },
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
  }
);

export default Product;