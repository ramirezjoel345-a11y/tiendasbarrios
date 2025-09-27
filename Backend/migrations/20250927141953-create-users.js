'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true, allowNull: false },
      name: { type: Sequelize.STRING(120), allowNull: false },
      email: { type: Sequelize.STRING(160), allowNull: false, unique: true },
      password: { type: Sequelize.STRING(200), allowNull: false },
      role: { type: Sequelize.ENUM('owner', 'admin', 'staff'), allowNull: false, defaultValue: 'owner' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Extensión uuid si no existiera (segura idempotente)
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    // Ajustar default si tu Postgres prefiere uuid_generate_v4() de uuid-ossp
    await queryInterface.changeColumn('users', 'id', {
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.literal('uuid_generate_v4()'),
      primaryKey: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_users_role";`);
  }
};
