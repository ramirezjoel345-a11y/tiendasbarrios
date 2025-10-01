const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

require('dotenv').config();
const { verifyAccess } = require('./src/utils/jwt');
const routesIndex = require('./src/routes/index'); // debe exportar y montar /api/*
const { sequelize, StoreMember, Message, User } = require('./src/models');

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Rutas
app.use('/api', routesIndex);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

// Auth para sockets
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('no token'));
    socket.user = verifyAccess(token.replace(/^Bearer\s+/i, ''));
    next();
  } catch {
    next(new Error('invalid token'));
  }
});

io.on('connection', (socket) => {
  // unirse a una tienda
  socket.on('store:join', async ({ storeId }) => {
    if (!storeId) return;
    const m = await StoreMember.findOne({ where: { store_id: storeId, user_id: socket.user.sub } });
    if (!m) return; // no es miembro
    socket.join(`store:${storeId}`);
    socket.emit('store:joined', { storeId });
  });

  // salir
  socket.on('store:leave', ({ storeId }) => {
    if (!storeId) return;
    socket.leave(`store:${storeId}`);
  });

  // enviar mensaje
  socket.on('store:message', async ({ storeId, content }) => {
    if (!storeId || !content || !content.trim()) return;
    const m = await StoreMember.findOne({ where: { store_id: storeId, user_id: socket.user.sub } });
    if (!m) return;

    const msg = await Message.create({ store_id: storeId, user_id: socket.user.sub, content: content.trim() });
    const full = await Message.findByPk(msg.id, { include: [{ model: User, as: 'author', attributes: ['id','name','email'] }] });
    io.to(`store:${storeId}`).emit('store:message', { message: full });
  });
});

// arranque
const PORT = process.env.PORT || 4000;
server.listen(PORT, async () => {
  await sequelize.authenticate();
  console.log(`API on http://localhost:${PORT}`);
});
