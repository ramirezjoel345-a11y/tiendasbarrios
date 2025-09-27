'use strict';
const { v4: uuid } = require('uuid');

module.exports = {
  async up (queryInterface, Sequelize) {
    // Toma el admin recién creado
    const [rows] = await queryInterface.sequelize.query(`SELECT id FROM users WHERE email='admin@demo.com' LIMIT 1;`);
    const ownerId = rows?.[0]?.id;
    if (!ownerId) return;

    await queryInterface.bulkInsert('stores', [{
      id: uuid(),
      name: 'Tienda Central',
      address: 'Calle 123',
      phone: '3001234567',
      ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  async down (queryInterface) {
    await queryInterface.bulkDelete('stores', { name: 'Tienda Central' }, {});
  }
};
