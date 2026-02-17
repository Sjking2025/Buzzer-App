const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initializeGameState } = require('./gameState');
const { registerSocketHandlers } = require('./socketHandlers');

const app = express();
const server = http.createServer(app);

app.use(cors());

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity in local network
    methods: ["GET", "POST"]
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
