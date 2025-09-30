// db/config.js
require('dotenv').config();

const base = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || 'tiendabarrios',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 5432),
  dialect: 'postgres',
};

module.exports = {
  development: { ...base, logging: console.log },
  test:        { ...base, database: (process.env.DB_NAME_TEST || 'tiendabarrios_test'), logging: false },
  production:  { ...base, logging: false },
};
