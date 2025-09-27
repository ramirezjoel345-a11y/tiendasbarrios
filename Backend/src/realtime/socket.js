const jwt = require('jsonwebtoken');
const { Store, Conversation, Message, User } = require('../models');

/**
 * Autentica el socket usando el token enviado en 'auth.token'
 * Retorna { id, email, role } si es válido; lanza si no.
 */
function verifySocketAuth(socket) {
  const token = socket.handshake.auth?.token || null;
  if (!token) {
    const err = new Error('Token requerido');
    err.data = { code: 'NO_TOKEN' };
    throw err;
  }
  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    return decoded; // { id, email, role }
  } catch (e) {
    const err = new Error('Token inválido o expirado');
    err.data = { code: 'BAD_TOKEN' };
    throw err;
  }
}

async function ensureConversation(storeId, userId) {
  const store = await Store.findByPk(storeId);
  if (!store || !store.isActive) throw new Error('Tienda no encontrada');

  let conv = await Conversation.findOne({
    where: { storeId, customerUserId: userId, status: 'OPEN' },
  });
  if (!conv) {
    conv = await Conversation.create({ storeId, customerUserId: userId, status: 'OPEN' });
  }
  return { store, conv };
}

module.exports = function setupSocket(io) {
  io.use((socket, next) => {
    try {
      const user = verifySocketAuth(socket);
      socket.user = user;
      next();
    } catch (err) {
      next(err);
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_shop', async ({ shopId }, cb) => {
      try {
        if (!shopId || typeof shopId !== 'string') throw new Error('shopId requerido');
        const { store, conv } = await ensureConversation(shopId, socket.user.id);
        socket.join(`shop:${store.id}`);
        cb?.({ ok: true, conversationId: conv.id });
      } catch (err) {
        cb?.({ ok: false, error: err.message });
      }
    });

    socket.on('message:send', async ({ shopId, content }, cb) => {
      try {
        if (!shopId || typeof shopId !== 'string') throw new Error('shopId requerido');
        if (!content || typeof content !== 'string' || !content.trim()) throw new Error('content requerido');

        const { store, conv } = await ensureConversation(shopId, socket.user.id);
        const msg = await Message.create({
          conversationId: conv.id,
          senderType: 'USER',
          senderUserId: socket.user.id,
          body: content.trim(),
        });

        const sender = await User.findByPk(socket.user.id, {
          attributes: ['id', 'name', 'role'], 
        });

        io.to(`shop:${store.id}`).emit('message:new', {
          id: msg.id,
          conversationId: conv.id,
          body: msg.body,
          createdAt: msg.createdAt,
          sender: sender ? sender.toJSON() : { id: socket.user.id },
        });

        cb?.({ ok: true });
      } catch (err) {
        cb?.({ ok: false, error: err.message });
      }
    });

    socket.on('disconnect', () => {
      // Limpieza si hiciera falta
    });
  });
};