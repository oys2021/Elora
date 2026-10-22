// Lets the admin panel show when each customer last signed in.
// Existing users stay empty until their next login.
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'lastLoginAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'lastLoginAt');
  },
};
