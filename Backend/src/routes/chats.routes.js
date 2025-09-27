const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/chats.controller');
const auth = require('../middlewares/auth'); // <-- PLURAL

router.post('/', auth.isAuthenticated, ctrl.openOrGet);
router.get('/:id', auth.isAuthenticated, ctrl.get);
router.get('/:id/messages', auth.isAuthenticated, ctrl.listMessages);
router.post('/:id/messages', auth.isAuthenticated, ctrl.sendMessage);
router.post('/:id/read', auth.isAuthenticated, ctrl.markRead);

module.exports = router;
