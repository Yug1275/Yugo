require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./socket/socketHandler');

const PORT = process.env.PORT || 5000;

// Log configured client URL for Socket.IO CORS
console.log('Socket CORS origin configured as:', process.env.CLIENT_URL || 'http://localhost:5173');

// ─── Create HTTP server ───────────────────────────────────────────────────
const server = http.createServer(app);

// ─── Initialize Socket.IO ─────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ─── Attach io to app so controllers can access it ───────────────────────
app.set('io', io);

// ─── Init socket event handlers ───────────────────────────────────────────
initSocket(io);

// ─── Start server ─────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`\n🚀 YUGO Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🔌 Socket.IO initialized\n`);
  });
};

// ─── Graceful shutdown ────────────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

startServer();