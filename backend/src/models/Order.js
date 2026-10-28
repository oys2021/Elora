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
    deliveryZoneId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'delivery_zones',
        key: 'id',
      },
    },
    // Snapshot of the fee charged at checkout — never recomputed from the
    // current rate card, so later price changes don't alter past orders.
    deliveryFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    // MTN / TELECEL / AIRTELTIGO are only on old orders from the dummy
    // gateway; new online orders use MOBILE_MONEY or CARD through Paystack.
    paymentMethod: {
      type: DataTypes.ENUM('CASH', 'MTN', 'TELECEL', 'AIRTELTIGO', 'MOBILE_MONEY', 'CARD'),
      allowNull: false,
      defaultValue: 'CASH',
    },
    // 'PAYSTACK' for online payments, null for cash.
    paymentProvider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Paystack transaction reference — one per order, never reused. Null for cash.
    paymentReference: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    // Paystack checkout page for this order; kept so a retry sends the
    // customer back to the same transaction rather than starting a new one.
    paymentAuthorizationUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // As reported by Paystack: 'mobile_money', 'card', ...
    paymentChannel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paystackTransactionId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Money arrived but needs a human look (wrong amount, paid after expiry, ...).
    paymentReviewReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // One checkout attempt = one order, however many times the request is sent.
    idempotencyKey: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
  }
);

export default Order;
