'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stores', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), allowNull: false, primaryKey: true },
      name: { type: Sequelize.STRING(150), allowNull: false },
      address: { type: Sequelize.STRING(255), allowNull: true },
      phone: { type: Sequelize.STRING(40), allowNull: true },
      ownerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('stores');
  }
};
