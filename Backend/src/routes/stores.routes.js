const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/stores.controller');
const auth = require('../middlewares/auth');

router.post('/', auth, ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);

module.exports = router;