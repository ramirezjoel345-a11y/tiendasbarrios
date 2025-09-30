// backend/src/realtime/ws.js
const { get } = require('./io');

function registerWsHandlers() {
  const io = get();

  io.on('connection', (socket) => {
    // Únete a una conversación (sala = conversationId)
    socket.on('conversation:join', (conversationId) => {
      if (!conversationId) return;
      socket.join(conversationId);
      socket.emit('conversation:joined', { conversationId });
    });

    // Sal de la conversación
    socket.on('conversation:leave', (conversationId) => {
      if (!conversationId) return;
      socket.leave(conversationId);
      socket.emit('conversation:left', { conversationId });
    });

    // Ping de vida
    socket.on('ping:client', () => {
      socket.emit('ping:server', Date.now());
    });
  });
}

module.exports = { registerWsHandlers };
