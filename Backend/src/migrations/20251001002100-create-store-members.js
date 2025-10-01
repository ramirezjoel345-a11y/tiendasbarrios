'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_store_members_role') THEN
          CREATE TYPE enum_store_members_role AS ENUM ('OWNER','MEMBER');
        END IF;
      END$$;
    `);

    await queryInterface.createTable('store_members', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      store_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'stores', key: 'id' }, onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE'
      },
      role: { type: 'enum_store_members_role', allowNull: false, defaultValue: 'MEMBER' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addConstraint('store_members', {
      fields: ['store_id', 'user_id'],
      type: 'unique',
      name: 'uniq_store_member'
    });
    await queryInterface.addIndex('store_members', ['store_id']);
    await queryInterface.addIndex('store_members', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('store_members');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_store_members_role";');
  }
};
