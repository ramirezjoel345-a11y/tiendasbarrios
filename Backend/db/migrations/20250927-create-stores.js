// backend/db/migrations/20250927-create-stores.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stores', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      ownerUserId: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING(120), allowNull: false },
      slug: { type: Sequelize.STRING(140), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT },
      photoUrl: { type: Sequelize.TEXT },
      coverUrl: { type: Sequelize.TEXT },
      phone: { type: Sequelize.STRING(30) },
      addressLine: { type: Sequelize.STRING(180) },
      lat: { type: Sequelize.DECIMAL(10,7) },
      lng: { type: Sequelize.DECIMAL(10,7) },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('stores'); }
};
