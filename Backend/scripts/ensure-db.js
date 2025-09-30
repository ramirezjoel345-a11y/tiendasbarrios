require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  const admin = new Client({
    host: DB_HOST || 'localhost',
    port: Number(DB_PORT || 5432),
    user: DB_USER || 'postgres',
    password: DB_PASSWORD,
    database: 'postgres'
  });

  try {
    await admin.connect();
    const check = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [DB_NAME]);
    if (check.rowCount === 0) {
      console.log(`Creando base '${DB_NAME}'...`);
      await admin.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log('✅ DB creada');
    } else {
      console.log('✅ DB ya existe');
    }
    await admin.end();
    process.exit(0);
  } catch (e) {
    console.error('❌ No se pudo crear/verificar la DB:', e.message);
    process.exit(1);
  }
})();
