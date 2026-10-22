import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Order extends Model {}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    customerPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'PAID', 'CANCELLED', 'REFUNDED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    zohoSyncStatus: {
      type: DataTypes.ENUM('PENDING', 'PROCESSING', 'SYNCED', 'FAILED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    zohoSalesOrderId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    syncAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    syncErrorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lastSyncedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fulfillmentMethod: {
      type: DataTypes.ENUM('PICKUP', 'DELIVERY'),
      allowNull: false,
      defaultValue: 'PICKUP',
    },
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deliveryCity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentMethod: {
      type: DataTypes.ENUM('CASH', 'MTN', 'TELECEL', 'AIRTELTIGO'),
      allowNull: false,
      defaultValue: 'CASH',
    },
    // Dummy payment gateway's made-up transaction id. Null for cash orders.
    paymentReference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
  }
);

export default Order;
