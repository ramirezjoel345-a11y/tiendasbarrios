require('dotenv').config();
const { Sequelize } = require('sequelize');

(async () => {
  try {
    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        dialect: 'postgres',
        logging: false
      }
    );
    await sequelize.authenticate();
    console.log('✅ Conexión OK');
    await sequelize.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Error de conexión:', e.message);
    process.exit(1);
  }
})();
