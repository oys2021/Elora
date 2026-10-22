// src/database/migrations/20260916100000-add-featured-bestseller-to-products.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'isFeatured', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('products', 'isBestseller', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'isFeatured');
    await queryInterface.removeColumn('products', 'isBestseller');
  },
};
