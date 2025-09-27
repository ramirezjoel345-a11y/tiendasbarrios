// src/routes/auth.routes.js
const { Router } = require('express');
const ctrlMod = require('../controllers/auth.controller');
const authMod = require('../middlewares/auth');

// Normaliza posibles export patterns (default, objeto, función directa)
const controller = ctrlMod?.default ?? ctrlMod;
const auth = typeof authMod === 'function'
  ? authMod
  : (authMod?.auth ?? authMod?.default);

// Guardas
if (!controller || typeof controller.login !== 'function') {
  console.error('❌ auth.controller.login no es función. Módulo importado:', controller);
  throw new Error('auth.controller.login no es una función (revisa export/import)');
}
if (typeof auth !== 'function') {
  console.error('❌ middleware auth no es función. Importado:', authMod);
  throw new Error('middleware auth no es una función');
}

const router = Router();

router.post('/login', controller.login);
router.get('/me', auth, controller.me);

module.exports = router;
