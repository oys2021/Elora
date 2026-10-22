// Homepage hero carousel slides, managed from the admin panel.
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('banners', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      imageUrl: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      // Optional: where the slide goes when clicked ("/products" or "https://...").
      linkUrl: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      // Slides show in ascending order.
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

    await queryInterface.addIndex('banners', ['sortOrder']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('banners');
  },
};
