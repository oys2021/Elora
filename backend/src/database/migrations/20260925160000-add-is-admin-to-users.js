// Marks which accounts may use the admin panel. Everyone is a normal customer
// by default; promote someone with `npm run admin:create`.
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'isAdmin', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'isAdmin');
  },
};
