'use strict';
const { v4: uuid } = require('uuid');
const bcrypt = require('bcrypt');

module.exports = {
  async up (queryInterface) {
    const hash = await bcrypt.hash('123456', 10);
    await queryInterface.bulkInsert('users', [{
      id: uuid(),
      name: 'Admin Demo',
      email: 'admin@demo.com',
      password: hash,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  async down (queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'admin@demo.com' }, {});
  }
};
