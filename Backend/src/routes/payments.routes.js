const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/payments.controller');
const auth = require('../middlewares/auth'); // <-- PLURAL

router.get('/store/:storeId', ctrl.listByStore);
router.post('/store/:storeId', auth.isAuthenticated, ctrl.addForStore);
router.put('/:id', auth.isAuthenticated, ctrl.update);
router.delete('/:id', auth.isAuthenticated, ctrl.remove);

module.exports = router;
