const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // JWT auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Token topilmadi'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('Foydalanuvchi topilmadi'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Token yaroqsiz'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`Socket connected: ${socket.user.username}`);

    // Online qilish
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    socket.join(userId); // private room — notifications uchun
    io.emit('userOnline', { userId });

    // Chat xonasiga qo'shilish
    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
    });

    // Chat xonasidan chiqish
    socket.on('leaveConversation', (conversationId) => {
      socket.leave(conversationId);
    });

    // Yozayapti indikatori
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit('typing', {
        userId,
        username: socket.user.username,
        isTyping,
      });
    });

    // Xabar o'qildi
    socket.on('messageRead', ({ conversationId }) => {
      socket.to(conversationId).emit('messageRead', { conversationId, userId });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      io.emit('userOffline', { userId });
      console.log(`Socket disconnected: ${socket.user.username}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io ishga tushmagan');
  return io;
};

module.exports = { initSocket, getIO };