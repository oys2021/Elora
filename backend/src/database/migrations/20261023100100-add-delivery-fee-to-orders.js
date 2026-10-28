// Links an order to the DeliveryZone used at checkout and records the fee
// actually charged, so later rate-card changes never retroactively change a
// past order's total.
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'deliveryZoneId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'delivery_zones',
        key: 'id',
      },
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('orders', 'deliveryFee', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('orders', 'deliveryFee');
    await queryInterface.removeColumn('orders', 'deliveryZoneId');
  },
};
