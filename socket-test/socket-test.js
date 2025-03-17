const { io } = require("socket.io-client");

console.log("Attempting to connect to WebSocket server at http://localhost:5001...");
const socket = io("http://localhost:5001", {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});

socket.on("connect", () => {
  console.log("Connected successfully! Socket ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

// Keep the process running
setTimeout(() => {
  console.log("Test complete. Disconnecting...");
  socket.disconnect();
  process.exit(0);
}, 5000);
