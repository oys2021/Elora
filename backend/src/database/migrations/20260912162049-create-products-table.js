// src/database/migrations/XXXXXXXXXXXXXX-create-products-table.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      zohoItemId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      basePrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      imageUrls: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      syncStatus: {
        type: Sequelize.ENUM('PENDING', 'PROCESSING', 'SYNCED', 'FAILED'),
        defaultValue: 'PENDING',
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

    await queryInterface.addIndex('products', ['categoryId']);
    await queryInterface.addIndex('products', ['slug']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('products');
    // Drop the ENUM type explicitly — Postgres doesn't clean it up automatically
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_products_syncStatus";');
  },
};