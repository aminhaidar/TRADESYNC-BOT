#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fixing TradeSync Bot application...${NC}"

# Stop any running processes
echo -e "Stopping any running processes..."
pkill -f "node.*server.js" || true
pkill -f "react-scripts" || true
sleep 2

# Fix the backend server
echo -e "${YELLOW}Updating backend server...${NC}"
cd backend-node

# Force port 5001 in server.js
sed -i.bak 's/const PORT = process.env.PORT || 5000;/const PORT = 5001;/g' server.js
sed -i.bak 's/const PORT = 5000;/const PORT = 5001;/g' server.js

# Start backend server
echo -e "${GREEN}Starting backend server on port 5001...${NC}"
PORT=5001 node server.js &
BACKEND_PID=$!
echo -e "${GREEN}Backend started with PID: ${BACKEND_PID}${NC}"

# Wait for backend to initialize
echo -e "Waiting for backend to initialize..."
sleep 3

# Fix frontend
echo -e "${YELLOW}Updating frontend code...${NC}"
cd ../frontend

# Update SocketContext.js with the working implementation
cat > SocketContext.js << 'EOFJS'
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  
  // Hardcoded backend URL
  const BACKEND_URL = 'http://localhost:5001';

  useEffect(() => {
    console.log(`Creating new socket connection to: ${BACKEND_URL}`);
    
    // Create a new socket instance with correct URL
    const newSocket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnectionAttempts: 10
    });
    
    setSocket(newSocket);
    
    // Socket event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
    });
    
    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });
    
    newSocket.on('live_trade_update', (data) => {
      console.log('Received trade update:', data);
      setLastMessage(data);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
    
    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection');
      newSocket.disconnect();
    };
  }, []); // Empty dependency array - run once on mount
  
  // Function to send messages
  const sendMessage = (event, data) => {
    if (socket && isConnected) {
      console.log(`Sending ${event}:`, data);
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot send message');
    }
  };
  
  return (
    <SocketContext.Provider value={{ socket, isConnected, lastMessage, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
EOFJS

# Create a .env file
echo "REACT_APP_BACKEND_URL=http://localhost:5001" > .env
echo "PORT=3001" >> .env

# Start the frontend
echo -e "${GREEN}Starting frontend on port 3001...${NC}"
PORT=3001 npm start

# If we reach here, something went wrong
echo -e "${RED}Frontend process exited. Killing backend...${NC}"
kill $BACKEND_PID || true
