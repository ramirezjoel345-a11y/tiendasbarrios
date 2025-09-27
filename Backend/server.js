const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const { sequelize } = require('./models'); // usa models/index.js

const app = express();

// Middlewares de seguridad y parsing
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ← AGREGADO
app.use(morgan('dev'));

// Healthchecks
app.get('/', (_req, res) => res.send('API TiendaBarrios 🚀'));
app.get('/health/db', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ ok: true, db: 'connected' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// 👇 AGREGAR RUTAS PRINCIPALES - IMPORTANTE
const routes = require('./routes');
app.use('/api/v1', routes); // ← Prefijo versionado recomendado
// o si prefieres sin prefijo: app.use('/', routes);

// IMPORTANTE: en producción NO uses alter/sync. Usa migraciones.
// Aquí solo autenticamos conexión.
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL');
    app.listen(env.PORT, () => {
      console.log(`Servidor en http://localhost:${env.PORT}`);
    });
  } catch (err) {
    console.error('❌ Error al conectar Postgres:', err);
    process.exit(1);
  }
})();

module.exports = app; // ← AGREGADO para testing o otros usos