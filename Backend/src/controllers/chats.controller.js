// backend/src/controllers/chats.controller.js
const { Conversation, Store, Message } = require('../models');

async function ensureAccess(conversationId, userId) {
  const conv = await Conversation.findByPk(conversationId);
  if (!conv) return { error: { status: 404, message: 'Conversation not found' } };

  const store = await Store.findByPk(conv.storeId);
  const isCustomer = conv.customerUserId === userId;
  const isStoreOwner = store?.ownerUserId === userId;
  if (!isCustomer && !isStoreOwner) {
    return { error: { status: 403, message: 'Forbidden' } };
  }
  return { conv, store, isCustomer, isStoreOwner };
}

exports.openOrGet = async (req, res) => {
  const { storeId } = req.body || {};
  if (!storeId) return res.status(400).json({ ok: false, message: 'storeId requerido' });

  const store = await Store.findByPk(storeId);
  if (!store) return res.status(404).json({ ok: false, message: 'Store not found' });

  let conv = await Conversation.findOne({
    where: { storeId, customerUserId: req.user.id, status: 'OPEN' }
  });
  
  if (!conv) {
    conv = await Conversation.create({ storeId, customerUserId: req.user.id, status: 'OPEN' });
  }
  res.status(201).json({ ok: true, data: conv });
};

exports.get = async (req, res) => {
  const { conv, error } = await ensureAccess(req.params.id, req.user.id);
  if (error) return res.status(error.status).json({ ok: false, message: error.message });

  res.json({ ok: true, data: conv });
};

exports.listMessages = async (req, res) => {
  const { conv, error } = await ensureAccess(req.params.id, req.user.id);
  if (error) return res.status(error.status).json({ ok: false, message: error.message });

  const msgs = await Message.findAll({ 
    where: { conversationId: conv.id }, 
    order: [['createdAt', 'ASC']] 
  });
  res.json({ ok: true, data: msgs });
};

exports.sendMessage = async (req, res) => {
  const { conv, error, isCustomer } = await ensureAccess(req.params.id, req.user.id);
  if (error) return res.status(error.status).json({ ok: false, message: error.message });

  const body = req.body?.body || '';
  if (!body.trim()) return res.status(400).json({ ok: false, message: 'body requerido' });

  const senderType = isCustomer ? 'USER' : 'STORE';
  const msg = await Message.create({
    conversationId: conv.id,
    senderType,
    senderUserId: isCustomer ? req.user.id : null,
    body: body.trim(),
  });
  res.status(201).json({ ok: true, data: msg });
};

exports.markRead = async (req, res) => {
  const { conv, error, isCustomer } = await ensureAccess(req.params.id, req.user.id);
  if (error) return res.status(error.status).json({ ok: false, message: error.message });

  await Message.update(
    { readAt: new Date() },
    {
      where: {
        conversationId: conv.id,
        readAt: null,
        senderType: isCustomer ? 'STORE' : 'USER',
      },
    }
  );
  res.json({ ok: true });
};