'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      store_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'stores', key: 'id' }, onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE'
      },
      content: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('messages', ['store_id', 'created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('messages');
  }
};
