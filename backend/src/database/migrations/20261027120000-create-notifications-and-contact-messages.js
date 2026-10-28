// In-app notifications (bell icon) and messages sent from the Contact page.
//
// notifications.dedupeKey is unique so the same event (e.g. "order X paid")
// can only ever create one notification, even if the payment is confirmed by
// several triggers at once — which is also what stops duplicate emails.
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      // Set for a customer's own notifications; null for ADMIN ones (shared by all admins).
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      audience: { type: Sequelize.ENUM('CUSTOMER', 'ADMIN'), allowNull: false },
      type: { type: Sequelize.STRING, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      body: { type: Sequelize.TEXT, allowNull: true },
      link: { type: Sequelize.STRING, allowNull: true },
      dedupeKey: { type: Sequelize.STRING, allowNull: true, unique: true },
      readAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('notifications', ['audience', 'userId', 'readAt', 'createdAt'], {
      name: 'notifications_audience_user_read_created',
    });

    await queryInterface.createTable('contact_messages', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false },
      subject: { type: Sequelize.STRING, allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('contact_messages');
    await queryInterface.dropTable('notifications');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_notifications_audience";');
  },
};
