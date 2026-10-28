import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// A message sent from the Contact page. Saved first, then emailed, so nothing
// is lost if email delivery has a bad day.
class ContactMessage extends Model {}

ContactMessage.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } },
    subject: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
  },
  { sequelize, modelName: 'ContactMessage', tableName: 'contact_messages' }
);

export default ContactMessage;
