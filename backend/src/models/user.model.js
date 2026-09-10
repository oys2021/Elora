import { DataTypes, Model } from 'sequelize';

export default function defineUser(sequelize) {
  class User extends Model {
    static associate(models) {
      // e.g. User.hasMany(models.Order);
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      googleId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      displayName: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
    },
  );

  return User;
}
