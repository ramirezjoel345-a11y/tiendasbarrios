'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('stores', 'welcome_message', { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('stores', 'cover_url',       { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('stores', 'address',         { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('stores', 'lat',             { type: Sequelize.DECIMAL(9,6), allowNull: true });
    await queryInterface.addColumn('stores', 'lng',             { type: Sequelize.DECIMAL(9,6), allowNull: true });
    await queryInterface.addColumn('stores', 'open_time',       { type: Sequelize.TIME, allowNull: true });
    await queryInterface.addColumn('stores', 'close_time',      { type: Sequelize.TIME, allowNull: true });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('stores', 'welcome_message');
    await queryInterface.removeColumn('stores', 'cover_url');
    await queryInterface.removeColumn('stores', 'address');
    await queryInterface.removeColumn('stores', 'lat');
    await queryInterface.removeColumn('stores', 'lng');
    await queryInterface.removeColumn('stores', 'open_time');
    await queryInterface.removeColumn('stores', 'close_time');
  }
};
