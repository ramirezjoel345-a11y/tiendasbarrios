const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/payments.controller');
const auth = require('../middlewares/auth');

router.get('/store/:storeId', ctrl.listByStore);
router.post('/store/:storeId', auth, ctrl.addForStore);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;