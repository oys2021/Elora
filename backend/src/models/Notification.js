import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// A bell-icon notification. CUSTOMER ones belong to one user; ADMIN ones
// (userId null) are shared by every admin.
class Notification extends Model {}

Notification.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: true },
    audience: { type: DataTypes.ENUM('CUSTOMER', 'ADMIN'), allowNull: false },
    // e.g. 'ORDER_PLACED', 'ORDER_PAID', 'CONTACT_MESSAGE'
    type: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: true },
    // Where clicking it goes, e.g. '/orders'
    link: { type: DataTypes.STRING, allowNull: true },
    // One notification per event, however many times the event fires.
    dedupeKey: { type: DataTypes.STRING, allowNull: true, unique: true },
    readAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: 'Notification', tableName: 'notifications' }
);

export default Notification;
