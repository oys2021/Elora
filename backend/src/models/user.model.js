// models/User.js
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class User extends Model {
  // Never leak the password hash or reset-token internals, e.g. via /auth/user.
  toJSON() {
    const values = { ...this.get() };
    delete values.passwordHash;
    delete values.resetPasswordTokenHash;
    delete values.resetPasswordExpiresAt;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // Set for accounts created with "Continue with Google"; null for password accounts.
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    // Set for password accounts (stored lowercase); null for Google accounts.
    username: {
      type: DataTypes.STRING(30),
      allowNull: true,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // "Forgot password" flow: a hash of the one-time reset token, and when it
    // expires. Never store the raw token — see the migration for why.
    resetPasswordTokenHash: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    resetPasswordExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
  }
);

export default User;
