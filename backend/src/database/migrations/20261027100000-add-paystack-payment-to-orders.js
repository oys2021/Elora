// Real online payments through Paystack.
//
// - idempotencyKey: one checkout attempt = one order. A double click or a
//   retried request with the same key gets the existing order back instead of
//   creating (and charging for) a second one.
// - paymentReference is now Paystack's transaction reference, so it must be
//   unique: one order <-> one Paystack transaction.
// - paystackTransactionId is unique for the same reason in the other direction.
export default {
  async up(queryInterface, Sequelize) {
    // ADD VALUE can't run inside a transaction block, so these go first, alone.
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_orders_paymentMethod" ADD VALUE IF NOT EXISTS 'MOBILE_MONEY';`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_orders_paymentMethod" ADD VALUE IF NOT EXISTS 'CARD';`
    );

    await queryInterface.addColumn('orders', 'paymentProvider', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('orders', 'paymentAuthorizationUrl', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('orders', 'paymentChannel', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('orders', 'paystackTransactionId', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn('orders', 'paidAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    // Set when money arrived but something about it needs a human: wrong
    // amount/currency, or paid after the order had expired.
    await queryInterface.addColumn('orders', 'paymentReviewReason', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('orders', 'idempotencyKey', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    await queryInterface.addIndex('orders', ['paymentReference'], {
      unique: true,
      name: 'orders_payment_reference_unique',
    });
    // The reconciler's sweep: pending Paystack orders, oldest first.
    await queryInterface.addIndex('orders', ['paymentProvider', 'status', 'createdAt'], {
      name: 'orders_payment_provider_status_created_at',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('orders', 'orders_payment_provider_status_created_at');
    await queryInterface.removeIndex('orders', 'orders_payment_reference_unique');
    await queryInterface.removeColumn('orders', 'idempotencyKey');
    await queryInterface.removeColumn('orders', 'paymentReviewReason');
    await queryInterface.removeColumn('orders', 'paidAt');
    await queryInterface.removeColumn('orders', 'paystackTransactionId');
    await queryInterface.removeColumn('orders', 'paymentChannel');
    await queryInterface.removeColumn('orders', 'paymentAuthorizationUrl');
    await queryInterface.removeColumn('orders', 'paymentProvider');
    // Postgres can't drop enum values; MOBILE_MONEY / CARD stay on the type.
  },
};
