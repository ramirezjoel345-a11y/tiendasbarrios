// src/routes/index.js
const express = require('express');
const router = express.Router();

// ping de verificación
router.get('/health', (_req, res) => res.json({ ok: true }));

router.use('/auth', require('./auth.routes'));
router.use('/protected', require('./protected.routes'));
router.use('/stores', require('./stores.routes'));

module.exports = router;
