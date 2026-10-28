import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class DeliveryZone extends Model {}

DeliveryZone.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // e.g. "ACCRA, TEMA" — shown to customers as the delivery destination.
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstKgPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    extraKgPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    // Free text, e.g. "Next Day", "48 Hours", "Thursdays".
    deliveryDuration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deliveryMode: {
      type: DataTypes.ENUM('DOOR_TO_DOOR', 'OFFICE_PICKUP'),
      allowNull: false,
      defaultValue: 'DOOR_TO_DOOR',
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
    modelName: 'DeliveryZone',
    tableName: 'delivery_zones',
  }
);

export default DeliveryZone;
