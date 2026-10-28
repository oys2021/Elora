// Admin-configurable delivery rate card (modelled on a courier rate card:
// a price for the first kg per location, plus an extra-kg rate, duration and
// mode). Orders reference the zone used at checkout so historical fees stay
// correct even if the admin changes prices later.
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('delivery_zones', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      firstKgPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      extraKgPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      deliveryDuration: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      deliveryMode: {
        type: Sequelize.ENUM('DOOR_TO_DOOR', 'OFFICE_PICKUP'),
        allowNull: false,
        defaultValue: 'DOOR_TO_DOOR',
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('delivery_zones', ['sortOrder']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('delivery_zones');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_delivery_zones_deliveryMode";');
  },
};
