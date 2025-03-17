#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting TradeSync Bot Fix...${NC}"

# Kill any existing processes
echo -e "${YELLOW}Killing any existing node processes...${NC}"
pkill -f "node" || true
sleep 2

# Check the directory structure
echo -e "${YELLOW}Checking directory structure...${NC}"
ls -la

# Check if backend-node exists
if [ -d "backend-node" ]; then
  echo -e "${GREEN}Found backend-node directory${NC}"
  
  # Update backend server to use port 5001
  cd backend-node
  echo -e "${YELLOW}Updating backend server...${NC}"
  
  # Check if server.js exists
  if [ -f "server.js" ]; then
    # Make a backup
    cp server.js server.js.backup
    
    # Replace port in server.js
    sed -i '' 's/const PORT = process.env.PORT || 5000;/const PORT = 5001;/g' server.js
    sed -i '' 's/const PORT = 5000;/const PORT = 5001;/g' server.js
    
    # Start the server
    echo -e "${GREEN}Starting backend server on port 5001...${NC}"
    node server.js &
    BACKEND_PID=$!
    echo -e "${GREEN}Backend started with PID: ${BACKEND_PID}${NC}"
    
    # Wait for backend to initialize
    echo -e "${YELLOW}Waiting for backend to initialize...${NC}"
    sleep 3
    
    # Check if frontend directory exists
    cd ..
    if [ -d "frontend" ]; then
      echo -e "${GREEN}Found frontend directory${NC}"
      cd frontend
      
      # Create new SocketContext.js
      echo -e "${YELLOW}Creating new SocketContext.js...${NC}"
      cat > SocketContext.js << 'EOFJS'
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

// HARDCODED URL
const BACKEND_URL = 'http://localhost:5001';
console.log('HARDCODED BACKEND URL:', BACKEND_URL);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    console.log(`Creating brand new socket connection to: ${BACKEND_URL}`);
    
    // Create socket
    const newSocket = io(BACKEND_URL, {
      forceNew: true,
      transports: ['polling', 'websocket']
    });
    
    setSocket(newSocket);
    
    // Socket events
    newSocket.on('connect', () => {
      console.log('Successfully connected to socket server:', newSocket.id);
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
    
    newSocket.on('connection_response', (data) => {
      console.log('Connection response:', data);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    // Cleanup
    return () => {
      console.log('Cleaning up socket connection');
      newSocket.disconnect();
    };
  }, []);
  
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

      # Create .env file
      echo -e "${YELLOW}Creating .env file...${NC}"
      echo "REACT_APP_BACKEND_URL=http://localhost:5001" > .env
      echo "PORT=3001" >> .env
      
      # Start frontend
      echo -e "${GREEN}Starting frontend on port 3001...${NC}"
      PORT=3001 npm start
      
      # If we get here, frontend exited
      echo -e "${RED}Frontend process exited. Killing backend...${NC}"
      kill $BACKEND_PID || true
    else
      echo -e "${RED}Frontend directory not found!${NC}"
      kill $BACKEND_PID || true
    fi
  else
    echo -e "${RED}server.js not found in backend-node!${NC}"
  fi
else
  echo -e "${RED}backend-node directory not found!${NC}"
fi
