const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

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
    // Un cliente conectado y autenticado
    // Eventos:
    // - join_shop: el cliente se une a la sala de una tienda
    // - message:send: envía un mensaje a la tienda

    socket.on('join_shop', async ({ shopId }, cb) => {
      try {
        if (!shopId || typeof shopId !== 'string') throw new Error('shopId requerido');

        const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { id: true, isActive: true } });
        if (!shop || !shop.isActive) throw new Error('Tienda no encontrada');

        socket.join(`shop:${shopId}`);
        cb?.({ ok: true, message: `Unido a shop:${shopId}` });
      } catch (err) {
        cb?.({ ok: false, error: err.message });
      }
    });

    socket.on('message:send', async ({ shopId, content }, cb) => {
      try {
        if (!shopId || typeof shopId !== 'string') throw new Error('shopId requerido');
        if (!content || typeof content !== 'string' || !content.trim()) throw new Error('content requerido');

        // Verifica tienda existe
        const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { id: true, isActive: true } });
        if (!shop || !shop.isActive) throw new Error('Tienda no encontrada');

        // Crea mensaje
        const msg = await prisma.message.create({
          data: {
            shopId,
            senderId: socket.user.id,
            content: content.trim()
          },
          include: {
            sender: { select: { id: true, name: true, photoUrl: true, role: true } }
          }
        });

        // Emite a todos en la sala (incluido el emisor)
        io.to(`shop:${shopId}`).emit('message:new', {
          id: msg.id,
          shopId: msg.shopId,
          content: msg.content,
          createdAt: msg.createdAt,
          sender: msg.sender
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
