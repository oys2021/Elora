// Adds username + password login alongside Google sign-in.
// Existing (Google) users keep working: their googleId is untouched and the new
// columns are simply empty for them.
export default {
  async up(queryInterface, Sequelize) {
    // Password accounts have no Google id.
    await queryInterface.changeColumn('users', 'googleId', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn('users', 'username', {
      type: Sequelize.STRING(30),
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn('users', 'passwordHash', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'passwordHash');
    await queryInterface.removeColumn('users', 'username');

    // Password accounts have no googleId, so they must go before it can be required again.
    await queryInterface.bulkDelete('users', { googleId: null });
    await queryInterface.changeColumn('users', 'googleId', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },
};
