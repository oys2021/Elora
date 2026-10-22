import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class ProductVariant extends Model {}

ProductVariant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    zohoVariantId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    lengthOption: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    densityOption: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    colorOption: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ProductVariant',
    tableName: 'product_variants',
  }
);

export default ProductVariant;