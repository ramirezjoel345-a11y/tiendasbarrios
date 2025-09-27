'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('conversations', {
      id: { type: S.UUID, primaryKey: true, defaultValue: S.literal('gen_random_uuid()') },
      storeId: { type: S.UUID, allowNull: false, references: { model: 'stores', key: 'id' }, onDelete: 'CASCADE' },
      customerUserId: { type: S.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      status: { type: S.ENUM('OPEN','CLOSED'), allowNull: false, defaultValue: 'OPEN' },
      createdAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
      updatedAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
    });
    await q.addIndex('conversations', ['storeId','customerUserId','status'], { unique: true, name: 'uniq_conv_store_user_status' });
  },
  async down(q) {
    await q.dropTable('conversations');
    await q.sequelize.query('DROP TYPE IF EXISTS "enum_conversations_status";');
  }
};
