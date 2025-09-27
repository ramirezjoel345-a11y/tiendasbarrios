const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/chats.controller');
const auth = require('../middlewares/auth');

router.post('/', auth, ctrl.openOrGet);
router.get('/:id', auth, ctrl.get);
router.get('/:id/messages', auth, ctrl.listMessages);
router.post('/:id/messages', auth, ctrl.sendMessage);
router.post('/:id/read', auth, ctrl.markRead);

module.exports = router;