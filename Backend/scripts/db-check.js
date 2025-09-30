// scripts/db-check.js
require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    const r = await client.query('select version(), current_database(), inet_server_port();');
    console.log('✅ Conectado:', r.rows[0]);
  } catch (e) {
    console.error('❌ Error de conexión:', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
