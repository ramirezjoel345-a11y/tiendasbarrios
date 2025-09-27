'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('messages', {
      id: { type: S.UUID, primaryKey: true, defaultValue: S.literal('gen_random_uuid()') },
      conversationId: { type: S.UUID, allowNull: false, references: { model: 'conversations', key: 'id' }, onDelete: 'CASCADE' },
      senderType: { type: S.ENUM('USER','STORE','ADMIN'), allowNull: false },
      senderUserId: { type: S.UUID, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      body: { type: S.TEXT, allowNull: false },
      readAt: { type: S.DATE },
      createdAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
      updatedAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
    });
  },
  async down(q) {
    await q.dropTable('messages');
    await q.sequelize.query('DROP TYPE IF EXISTS "enum_messages_senderType";');
  }
};
