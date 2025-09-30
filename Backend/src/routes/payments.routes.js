// backend/src/routes/payments.routes.js
const { Router } = require('express');
const router = Router();

const ctrl = require('../controllers/payments.controller');
const auth = require('../middlewares/auth');

// Actualizar/crear todos los métodos de pago de una tienda
router.put('/stores/:storeId/payments', auth, ctrl.upsertForStore);

// Listar métodos de pago de una tienda
router.get('/stores/:storeId/payments', ctrl.listForStore);

module.exports = router;
