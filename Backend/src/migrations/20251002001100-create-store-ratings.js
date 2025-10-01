'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('store_ratings', {
      id:         { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      store_id:   {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'stores', key: 'id' }, onDelete: 'CASCADE'
      },
      user_id:    {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE'
      },
      score:      { type: Sequelize.INTEGER, allowNull: false }, // 1..5
      comment:    { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addConstraint('store_ratings', {
      fields: ['store_id', 'user_id'],
      type: 'unique',
      name: 'uniq_store_rating_per_user'
    });
    await queryInterface.addIndex('store_ratings', ['store_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('store_ratings');
  }
};
