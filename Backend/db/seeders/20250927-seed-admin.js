'use strict';
const { v4: uuid } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  async up (qi) {
    const hash = await bcrypt.hash('123456', 10);
    await qi.bulkInsert('users', [{
      id: uuid(),
      name: 'Admin Demo',
      email: 'admin@demo.com',
      passwordHash: hash,      // <- coincide con el modelo y el login
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  async down (qi) {
    await qi.bulkDelete('users', { email: 'admin@demo.com' }, {});
  }
};
