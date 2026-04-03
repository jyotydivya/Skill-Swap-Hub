require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const paymentRoutes = require("./routes/payments");
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] }
});

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use("/api/payments", paymentRoutes);

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/skills',   require('./routes/skills'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/reviews',  require('./routes/reviews'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/chat',     require('./routes/chat'));

app.get('/api/health', (req, res) =>
  res.json({ status: 'SkillSwap Hub API is running', time: new Date() })
);

// ── Socket.IO — Real-time Chat ────────────────────────────────
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', data);
  });

  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user_typing', data);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// ── Start ─────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on http://localhost:${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });

module.exports = { io };
