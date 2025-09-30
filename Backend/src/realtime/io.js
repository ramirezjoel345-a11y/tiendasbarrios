// Backend/src/realtime/io.js
const { Server } = require('socket.io');

let io = null;

function init(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET','POST','PATCH'],
      allowedHeaders: ['Content-Type','Authorization'],
      credentials: false,
    },
    transports: ['websocket'],
    path: '/socket.io',
  });

  io.on('connection', (socket) => {
    console.log('⚡ Cliente conectado', socket.id);

    socket.on('conversation:join', (conversationId) => {
      if (!conversationId) return;
      socket.join(conversationId);
      socket.emit('conversation:joined', { conversationId });
    });

    socket.on('conversation:leave', (conversationId) => {
      if (!conversationId) return;
      socket.leave(conversationId);
      socket.emit('conversation:left', { conversationId });
    });

    // typing opcional
    socket.on('typing:start', ({ conversationId, senderType }) => {
      if (conversationId) socket.to(conversationId).emit('typing', { senderType, isTyping: true });
    });
    socket.on('typing:stop', ({ conversationId, senderType }) => {
      if (conversationId) socket.to(conversationId).emit('typing', { senderType, isTyping: false });
    });

    socket.on('disconnect', (reason) => {
      console.log('⚡ Cliente desconectado', socket.id, reason);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.IO no inicializado');
  return io;
}

module.exports = { init, getIO };
