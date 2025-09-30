const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => res.json({ ok: true, message: 'TiendaBarrios backend running' }));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/protected', require('./routes/protected.routes'));

module.exports = app;
