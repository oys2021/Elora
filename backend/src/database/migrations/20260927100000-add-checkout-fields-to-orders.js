// Fields collected at checkout. Payment is a dummy simulation for now (no real
// payment provider), so paymentReference is just a generated stand-in id.
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'fulfillmentMethod', {
      type: Sequelize.ENUM('PICKUP', 'DELIVERY'),
      allowNull: false,
      defaultValue: 'PICKUP',
    });
    await queryInterface.addColumn('orders', 'deliveryAddress', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('orders', 'deliveryCity', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('orders', 'paymentMethod', {
      type: Sequelize.ENUM('CASH', 'MTN', 'TELECEL', 'AIRTELTIGO'),
      allowNull: false,
      defaultValue: 'CASH',
    });
    // Dummy gateway's made-up transaction id, e.g. "DUMMY-9F3KP2". Null for cash,
    // which is paid at pickup/delivery and never touches the dummy gateway.
    await queryInterface.addColumn('orders', 'paymentReference', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('orders', 'paymentReference');
    await queryInterface.removeColumn('orders', 'paymentMethod');
    await queryInterface.removeColumn('orders', 'deliveryCity');
    await queryInterface.removeColumn('orders', 'deliveryAddress');
    await queryInterface.removeColumn('orders', 'fulfillmentMethod');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_fulfillmentMethod";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_paymentMethod";');
  },
};
