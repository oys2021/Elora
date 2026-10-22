// src/database/migrations/20260915120100-create-order-items-table.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      variantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'product_variants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      unitPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
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

    await queryInterface.addIndex('order_items', ['orderId']);
    await queryInterface.addIndex('order_items', ['variantId']);

    await queryInterface.sequelize.query(`
      ALTER TABLE order_items
      ADD CONSTRAINT check_quantity_positive
      CHECK (quantity >= 1);
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('order_items');
  },
};
