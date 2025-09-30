require('dotenv').config();
const app = require('./src/index');
const { sequelize } = require('./src/models');

const PORT = Number(process.env.PORT || 4000);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB OK');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (e) {
    console.error('DB connection failed:', e);
    process.exit(1);
  }
})();
