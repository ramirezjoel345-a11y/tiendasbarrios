'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('store_ratings', {
      id: { type: S.UUID, primaryKey: true, defaultValue: S.literal('gen_random_uuid()') },
      storeId: { type: S.UUID, allowNull: false, references: { model: 'stores', key: 'id' }, onDelete: 'CASCADE' },
      userId: { type: S.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      rating: { type: S.INTEGER, allowNull: false },
      comment: { type: S.TEXT },
      createdAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
      updatedAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
    });
    await q.addConstraint('store_ratings', {
      fields: ['storeId','userId'],
      type: 'unique',
      name: 'uniq_store_user_rating'
    });
    await q.addConstraint('store_ratings', {
      fields: ['rating'],
      type: 'check',
      where: { rating: { [S.Op.between]: [1,5] } }
    });
  },
  async down(q) { await q.dropTable('store_ratings'); }
};
