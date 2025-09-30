require('dotenv').config();
const { Sequelize } = require('sequelize');

(async () => {
  const sequelize = new Sequelize(
    process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,
    { host: process.env.DB_HOST, port: +process.env.DB_PORT || 5432, dialect: 'postgres', logging: false }
  );
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'users' ORDER BY ordinal_position
    `);
    console.log('Columns in users:', rows.map(r => r.column_name));
  } catch (e) {
    console.error(e);
  } finally {
    await sequelize.close();
  }
})();
