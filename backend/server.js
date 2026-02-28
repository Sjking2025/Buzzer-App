const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initializeGameState } = require('./gameState');
const { registerSocketHandlers } = require('./socketHandlers');

const app = express();
const server = http.createServer(app);

// CORS — allow all origins in dev, restrict to FRONTEND_URL in production
const allowedOrigin = process.env.FRONTEND_URL || '*';

app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// Health check endpoint (used by Render to confirm service is up)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST']
  }
});

// Initialize Game State
const gameState = initializeGameState();

// Register Socket Handlers
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  registerSocketHandlers(io, socket, gameState);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
