// Supports the "forgot password" flow. The raw reset token is never stored —
// only its hash, the same reasoning as password storage: if the database
// leaked, the token alone couldn't be used to reset anyone's password.
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'resetPasswordTokenHash', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn('users', 'resetPasswordExpiresAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'resetPasswordExpiresAt');
    await queryInterface.removeColumn('users', 'resetPasswordTokenHash');
  },
};
