require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'supersecreto_ultra',
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: process.env.DB_PORT || '5433',
    USER: process.env.DB_USER || 'postgres',
    PASS: process.env.DB_PASSWORD || 'postgres',
    NAME: process.env.DB_NAME || 'tiendabarrios'
  }
};
