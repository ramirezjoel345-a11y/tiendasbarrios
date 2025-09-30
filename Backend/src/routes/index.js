const { Router } = require('express');
const stores = require('./stores.routes');

const api = Router();

api.get('/health', (_req, res) => res.json({ ok: true }));
api.use('/stores', stores);

module.exports = api;
