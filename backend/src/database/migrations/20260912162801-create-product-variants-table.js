// src/database/migrations/XXXXXXXXXXXXXX-create-product-variants-table.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_variants', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      zohoVariantId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      lengthOption: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      densityOption: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      colorOption: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      stockQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      price: {
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

    await queryInterface.addIndex('product_variants', ['productId']);
    await queryInterface.addIndex('product_variants', ['sku']);

    await queryInterface.sequelize.query(`
      ALTER TABLE product_variants
      ADD CONSTRAINT check_stock_quantity_non_negative
      CHECK ("stockQuantity" >= 0);
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_variants');
  },
};