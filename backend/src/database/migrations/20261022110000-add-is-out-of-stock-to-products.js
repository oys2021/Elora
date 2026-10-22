// Lets an admin manually flag a product as out of stock, independent of its
// variants' actual stockQuantity (e.g. a quality hold, or restocking without
// wanting to zero out every variant). When true it overrides the computed
// in-stock state on the storefront and blocks new orders.
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'isOutOfStock', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'isOutOfStock');
  },
};
