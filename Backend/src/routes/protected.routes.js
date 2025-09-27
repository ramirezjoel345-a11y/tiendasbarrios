// src/routes/protected.routes.js
'use strict';

const express = require('express');
const { authGuard } = require('../middlewares/auth');
const router = express.Router();

router.get('/ping', authGuard, (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'pong (protegido)',
    user: { id: req.user.sub, email: req.user.email, role: req.user.role },
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
