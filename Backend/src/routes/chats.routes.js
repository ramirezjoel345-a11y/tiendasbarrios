const { Router } = require('express');
const ctrl = require('../controllers/chats.controller');
const auth = require('../middlewares/auth'); // usa tu middleware real

const router = Router();

/**
 * Crea/asegura una conversación entre el usuario autenticado y la tienda :storeId
 * POST /api/v1/chat/stores/:storeId/conversations
 */
router.post('/stores/:storeId/conversations', auth, ctrl.createConversationForStore);

/**
 * (Opcional) Lista conversaciones de una tienda
 * GET /api/v1/chat/stores/:storeId/conversations
 */
router.get('/stores/:storeId/conversations', auth, ctrl.listConversationsByStore);

/**
 * Lista mensajes
 * GET /api/v1/chat/conversations/:conversationId/messages
 */
router.get('/conversations/:conversationId/messages', auth, ctrl.listMessages);

/**
 * Crea mensaje
 * POST /api/v1/chat/conversations/:conversationId/messages
 */
router.post('/conversations/:conversationId/messages', auth, ctrl.createMessage);

/**
 * Marca mensaje leído
 * PATCH /api/v1/chat/messages/:id/read
 */
router.patch('/messages/:id/read', auth, ctrl.markRead);

module.exports = router;
