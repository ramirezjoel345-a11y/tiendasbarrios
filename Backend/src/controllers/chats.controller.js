// backend/src/controllers/chats.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.openOrGet = async (req, res) => {
  const { storeId } = req.body || {};
  if (!storeId) return res.status(400).json({ ok: false, message: 'storeId requerido' });

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) return res.status(404).json({ ok: false, message: 'Store not found' });

  let conv = await prisma.conversation.findFirst({
    where: { storeId, customerUserId: req.user.id, status: 'OPEN' }
  });
  if (!conv) {
    conv = await prisma.conversation.create({ data: { storeId, customerUserId: req.user.id, status: 'OPEN' } });
  }
  res.status(201).json({ ok: true, data: conv });
};

exports.get = async (req, res) => {
  const conv = await prisma.conversation.findUnique({ where: { id: req.params.id } });
  if (!conv) return res.status(404).json({ ok: false, message: 'Conversation not found' });

  const store = await prisma.store.findUnique({ where: { id: conv.storeId } });
  const isCustomer = conv.customerUserId === req.user.id;
  const isStoreOwner = store?.ownerUserId === req.user.id;
  if (!isCustomer && !isStoreOwner) return res.status(403).json({ ok: false, message: 'Forbidden' });

  res.json({ ok: true, data: conv });
};

exports.listMessages = async (req, res) => {
  const conv = await prisma.conversation.findUnique({ where: { id: req.params.id } });
  if (!conv) return res.status(404).json({ ok: false, message: 'Conversation not found' });

  const store = await prisma.store.findUnique({ where: { id: conv.storeId } });
  const isCustomer = conv.customerUserId === req.user.id;
  const isStoreOwner = store?.ownerUserId === req.user.id;
  if (!isCustomer && !isStoreOwner) return res.status(403).json({ ok: false, message: 'Forbidden' });

  const msgs = await prisma.message.findMany({ where: { conversationId: conv.id }, orderBy: { createdAt: 'asc' } });
  res.json({ ok: true, data: msgs });
};

exports.sendMessage = async (req, res) => {
  const conv = await prisma.conversation.findUnique({ where: { id: req.params.id } });
  if (!conv) return res.status(404).json({ ok: false, message: 'Conversation not found' });

  const store = await prisma.store.findUnique({ where: { id: conv.storeId } });
  const isCustomer = conv.customerUserId === req.user.id;
  const isStoreOwner = store?.ownerUserId === req.user.id;
  if (!isCustomer && !isStoreOwner) return res.status(403).json({ ok: false, message: 'Forbidden' });

  const senderType = isCustomer ? 'USER' : 'STORE';
  const msg = await prisma.message.create({
    data: {
      conversationId: conv.id,
      senderType,
      senderUserId: isCustomer ? req.user.id : null,
      body: req.body?.body || ''
    }
  });
  res.status(201).json({ ok: true, data: msg });
};

exports.markRead = async (req, res) => {
  const conv = await prisma.conversation.findUnique({ where: { id: req.params.id } });
  if (!conv) return res.status(404).json({ ok: false, message: 'Conversation not found' });

  const store = await prisma.store.findUnique({ where: { id: conv.storeId } });
  const isCustomer = conv.customerUserId === req.user.id;
  const isStoreOwner = store?.ownerUserId === req.user.id;
  if (!isCustomer && !isStoreOwner) return res.status(403).json({ ok: false, message: 'Forbidden' });

  await prisma.message.updateMany({
    where: { conversationId: conv.id, readAt: null, senderType: isCustomer ? 'STORE' : 'USER' },
    data: { readAt: new Date() }
  });
  res.json({ ok: true });
};
