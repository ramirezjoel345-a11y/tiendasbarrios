// backend/src/routes/index.js
const { Router } = require('express');
const router = Router();

router.use('/auth', require('./auth.routes'));
router.use('/stores', require('./stores.routes'));
router.use('/payments', require('./payments.routes'));
router.use('/ratings', require('./ratings.routes'));
router.use('/conversations', require('./chats.routes'));

module.exports = router;
