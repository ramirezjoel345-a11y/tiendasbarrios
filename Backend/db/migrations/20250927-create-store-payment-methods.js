'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('store_payment_methods', {
      id: { type: S.UUID, primaryKey: true, defaultValue: S.literal('gen_random_uuid()') },
      storeId: { type: S.UUID, allowNull: false, references: { model: 'stores', key: 'id' }, onDelete: 'CASCADE' },
      type: { type: S.ENUM('CASH','CARD','NEQUI','DAVIPLATA','BANCOLOMBIA','MERCADOPAGO','STRIPE'), allowNull: false },
      isEnabled: { type: S.BOOLEAN, allowNull: false, defaultValue: true },
      details: { type: S.JSONB },
      createdAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
      updatedAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
    });
  },
  async down(q) {
    await q.dropTable('store_payment_methods');
    await q.sequelize.query('DROP TYPE IF EXISTS "enum_store_payment_methods_type";');
  }
};
