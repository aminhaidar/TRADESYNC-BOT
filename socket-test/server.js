const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Route for health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send welcome message
  socket.emit('welcome', { message: 'Connected to server!' });
  
  // Handle test message
  socket.on('test', (data) => {
    console.log('Received test message:', data);
    socket.emit('response', { message: 'Test received', data });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = 5001;
server.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
