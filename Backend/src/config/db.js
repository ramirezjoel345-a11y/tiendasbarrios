const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(
  env.DB.NAME,
  env.DB.USER,
  env.DB.PASS,
  {
    host: env.DB.HOST,
    port: env.DB.PORT,
    dialect: 'postgres',
    logging: false
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL');
  } catch (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
    process.exit(1);
  }
}

module.exports = { sequelize, connectDB };
