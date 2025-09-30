// src/routes/protected.routes.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/requireAuth');
const requireRole = require('../middlewares/requireRole');

router.get('/ping', requireAuth, (_req, res) => {
  res.json({ message: 'pong protegido' });
});

router.get('/admin-only', requireAuth, requireRole('admin'), (_req, res) => {
  res.json({ message: 'solo admin accedió' });
});

module.exports = router;
