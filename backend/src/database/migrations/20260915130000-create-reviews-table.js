// src/database/migrations/20260915130000-create-reviews-table.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reviews', {
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
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('reviews', ['productId']);
    await queryInterface.addIndex('reviews', ['productId', 'userId'], {
      unique: true,
      name: 'reviews_product_user_unique',
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE reviews
      ADD CONSTRAINT check_rating_range
      CHECK (rating >= 1 AND rating <= 5);
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reviews');
  },
};
