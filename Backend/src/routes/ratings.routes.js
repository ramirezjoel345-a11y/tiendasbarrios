const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/ratings.controller');
const auth = require('../middlewares/auth'); // <-- PLURAL

router.get('/store/:storeId', ctrl.listByStore);
router.get('/store/:storeId/avg', ctrl.avgForStore);
router.post('/store/:storeId', auth.isAuthenticated, ctrl.upsertForUser);

module.exports = router;
