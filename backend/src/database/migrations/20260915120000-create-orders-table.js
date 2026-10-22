// src/database/migrations/20260915120000-create-orders-table.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      customerName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      customerEmail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      customerPhone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'PAID', 'CANCELLED', 'REFUNDED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      zohoSyncStatus: {
        type: Sequelize.ENUM('PENDING', 'PROCESSING', 'SYNCED', 'FAILED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      zohoSalesOrderId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      syncAttempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      syncErrorMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      lastSyncedAt: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex('orders', ['userId']);
    await queryInterface.addIndex('orders', ['customerEmail']);
    await queryInterface.addIndex('orders', ['zohoSyncStatus']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('orders');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_zohoSyncStatus";');
  },
};
