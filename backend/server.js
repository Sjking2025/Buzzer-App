const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initializeGameState } = require('./gameState');
const { registerSocketHandlers } = require('./socketHandlers');

const app = express();
const server = http.createServer(app);

// CORS — allow all origins
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'buzzer-app-backend' });
});

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true
});

// Initialize Game State
const gameState = initializeGameState();

// Register Socket Handlers
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  registerSocketHandlers(io, socket, gameState);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});

// Handle Railway SIGTERM gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
