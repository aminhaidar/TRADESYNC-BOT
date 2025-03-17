#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Resetting TradeSync Bot Project ===${NC}"

# Kill any running processes on ports 5000 and 5001
echo -e "${YELLOW}Killing any processes on ports 5000 and 5001...${NC}"
lsof -ti:5000,5001 | xargs kill -9 2>/dev/null || true
sleep 2

# Clear frontend build cache
echo -e "${YELLOW}Clearing frontend build cache...${NC}"
cd frontend
rm -rf node_modules/.cache
rm -rf build

# Create direct replacement for SocketContext.js with hardcoded port 5001
echo -e "${YELLOW}Creating new SocketContext.js with port 5001...${NC}"
cat > SocketContext.js << 'EOT'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

// Hardcoded backend URL with port 5001
const BACKEND_URL = 'http://localhost:5001';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const socket = useRef(null);

  useEffect(() => {
    console.log("Initializing socket connection to:", BACKEND_URL);
    
    socket.current = io(BACKEND_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    socket.current.on('connect', () => {
      console.log('Socket connected successfully:', socket.current.id);
      setIsConnected(true);
    });

    socket.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.current.on('live_trade_update', (data) => {
      console.log('Received trade update:', data);
      setLastMessage(data);
    });

    socket.current.on('connection_response', (data) => {
      console.log('Connection response:', data);
    });

    socket.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      console.log("Cleaning up socket connection");
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  const sendMessage = (event, data) => {
    if (socket.current && isConnected) {
      console.log(`Sending ${event}:`, data);
      socket.current.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot send message');
    }
  };

  const value = {
    socket: socket.current,
    isConnected,
    lastMessage,
    sendMessage,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketContext;
EOT

# Create .env file for React environment variables
echo -e "${YELLOW}Creating .env file...${NC}"
cat > .env << 'EOT'
REACT_APP_BACKEND_URL=http://localhost:5001
PORT=3000
EOT

# Go back to project root
cd ..

# Fix the backend server to use port 5001
echo -e "${YELLOW}Updating backend server port...${NC}"
cd backend-node
cat > server.js.new << 'EOT'
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingInterval: 10000,
  pingTimeout: 5000
});

// Mock data
const mockTrades = [
  {
    id: 1,
    symbol: "AAPL",
    action: "buy",
    quantity: 1.0,
    price: 180.0,
    current_price: 185.75,
    status: "executed",
    timestamp: "2025-03-16 12:00:00",
    confidence: 0.85,
    source: "AI Insight",
    user: "System",
    url: "",
    option_details: "155C 04/17"
  }
];

const mockInsights = [
  {symbol: "AAPL", recommendation: "Buy", summary: "Strong upward trend with 85% confidence", confidence: 0.85, category: "technical"},
  {symbol: "MSFT", recommendation: "Buy", summary: "Positive earnings forecast with 90% confidence", confidence: 0.90, category: "fundamental"},
  {symbol: "TSLA", recommendation: "Sell", summary: "Overbought conditions with 75% confidence", confidence: 0.75, category: "technical"},
  {symbol: "AMZN", recommendation: "Hold", summary: "Market uncertainty with 65% confidence", confidence: 0.65, category: "news"},
  {symbol: "GOOGL", recommendation: "Buy", summary: "Breakout pattern with 80% confidence", confidence: 0.80, category: "technical"}
];

const chartData = {
  labels: ["2025-03-09", "2025-03-10", "2025-03-11", "2025-03-12", "2025-03-13"],
  datasets: [
    {label: "TradeSync Portfolio", data: [10562.58, 10634.92, 10689.87, 10742.42, 10798.81], borderColor: "#3fb950", backgroundColor: "rgba(63, 185, 80, 0.2)", tension: 0.4, fill: true},
    {label: "SPY Benchmark", data: [10532.55, 10578.12, 10615.93, 10650.85, 10695.67], borderColor: "#8b949e", backgroundColor: "rgba(139, 148, 158, 0.2)", tension: 0.4, fill: true}
  ]
};

const metrics = {
  accountValue: 10921.45,
  availableCash: 5243.67,
  totalPnl: 375.82,
  openPositions: 3,
  winRate: 72.5
};

const positions = [
  {symbol: "AAPL", quantity: 1, avgPrice: 180.00, currentPrice: 185.75, pnl: 5.75},
  {symbol: "MSFT", quantity: 2, avgPrice: 410.25, currentPrice: 412.50, pnl: 4.50},
  {symbol: "AMZN", quantity: 1, avgPrice: 178.50, currentPrice: 176.80, pnl: -1.70}
];

// API routes
app.get('/api/dashboard-data', (req, res) => {
  console.log('Dashboard data requested');
  const responseData = {
    trades: mockTrades,
    insights: mockInsights,
    chartData: chartData,
    metrics: metrics,
    positions: positions
  };

  res.json(responseData);
});

app.post('/api/trigger-trade', (req, res) => {
  const trade = {
    symbol: "AAPL",
    action: "buy",
    quantity: 1,
    price: 185.75,
    option_details: "155C 04/17",
    timestamp: new Date().toISOString(),
    source: "Manual Trigger",
    status: "pending",
    confidence: 0.85
  };

  io.emit('live_trade_update', trade);
  console.log('Manually triggered trade update:', trade);
  res.json({message: "Trade update triggered", trade: trade});
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.emit('connection_response', {status: 'connected'});

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('execute_trade', (data) => {
    console.log('Received execute_trade event:', data);

    const trade = {
      id: mockTrades.length + 1,
      symbol: data.symbol || "AAPL",
      action: data.action || "buy",
      quantity: data.quantity || 1,
      price: data.price || 185.75,
      current_price: data.price || 185.75,
      option_details: "155C 04/17",
      timestamp: new Date().toISOString(),
      status: "executed",
      confidence: data.confidence || 0.85,
      source: data.source || "TradeSync Bot"
    };

    mockTrades.push(trade);
    io.emit('live_trade_update', trade);
    console.log('Trade executed and broadcast:', trade);
  });
});

// Start server - HARDCODED to port 5001
const PORT = 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOT

# Replace the server.js file
mv server.js.new server.js

# Go back to project root
cd ..

# Create a new start script
echo -e "${YELLOW}Creating new start script...${NC}"
cat > start-fresh.sh << 'EOT'
#!/bin/bash
# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
  lsof -i:$1 >/dev/null 2>&1
  return $?
}

echo -e "${BLUE}=== Starting TradeSync Bot with Node.js Backend ===${NC}"

# Kill any running processes on ports 5000 and 5001
echo -e "${YELLOW}Ensuring no conflicting processes are running...${NC}"
if check_port 5001; then
  echo -e "${RED}Port 5001 is in use. Killing process...${NC}"
  lsof -ti:5001 | xargs kill -9
  sleep 2
fi

# Start the Node.js backend with a modified port
echo -e "${YELLOW}Starting Node.js backend server on port 5001...${NC}"
cd backend-node
node server.js &
BACKEND_PID=$!
echo -e "${GREEN}Backend started with PID: ${BACKEND_PID}${NC}"

# Wait for backend to be ready
echo "Waiting for backend to initialize..."
sleep 3

# Start the frontend development server in a new terminal
echo -e "${YELLOW}Starting React frontend...${NC}"
cd ../frontend

# Start the frontend in a new terminal
osascript -e 'tell app "Terminal" to do script "cd '$PWD' && npm start"'

echo -e "${BLUE}TradeSync Bot is now running!${NC}"
echo -e "${YELLOW}Backend URL: http://localhost:5001${NC}"
echo -e "${YELLOW}Frontend URL: http://localhost:3000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the backend server${NC}"

wait $BACKEND_PID
EOT

# Make scripts executable
chmod +x reset-project.sh
chmod +x start-fresh.sh

echo -e "${GREEN}Reset script created. Now run:${NC}"
echo -e "${YELLOW}./reset-project.sh${NC}"
echo -e "${GREEN}Then start the application with:${NC}"
echo -e "${YELLOW}./start-fresh.sh${NC}"
