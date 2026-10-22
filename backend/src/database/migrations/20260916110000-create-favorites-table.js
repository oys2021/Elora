// src/database/migrations/20260916110000-create-favorites-table.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('favorites', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('favorites', ['userId']);
    await queryInterface.addIndex('favorites', ['userId', 'productId'], {
      unique: true,
      name: 'favorites_user_product_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('favorites');
  },
};
