// src/seeders/99999999999999-seed-admin.js
'use strict';
require('dotenv').config();           // ← añade esto
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
// (resto igual: usa process.env.ADMIN_PASSWORD)

module.exports = {
  async up(queryInterface) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tiendabarrios.test';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
    const hashed = await bcrypt.hash(adminPassword, 10);

    await queryInterface.bulkInsert('users', [{
      id: uuidv4(),                 // ← importante: la migración no pone default, lo damos aquí
      name: 'Administrador',
      email: adminEmail,
      password_hash: hashed,
      role: 'ADMIN',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },

  async down(queryInterface) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tiendabarrios.test';
    await queryInterface.bulkDelete('users', { email: adminEmail });
  },
};
