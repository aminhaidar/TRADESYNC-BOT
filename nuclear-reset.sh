#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${RED}PERFORMING NUCLEAR RESET OF TRADESYNC BOT${NC}"

# 1. Kill all node processes
echo -e "${YELLOW}Killing all node processes...${NC}"
pkill -f node || true
sleep 2

# 2. Find all references to port 5000 in the frontend code
echo -e "${YELLOW}Finding all references to port 5000 in frontend code...${NC}"
cd frontend
grep -r "5000" --include="*.js" --include="*.jsx" --include="*.json" .

# 3. Replace all instances of port 5000 with 5001
echo -e "${YELLOW}Replacing all instances of port 5000 with 5001...${NC}"
find . -type f -name "*.js" -o -name "*.jsx" -o -name "*.json" | xargs sed -i.bak 's/localhost:5000/localhost:5001/g'
find . -type f -name "*.js" -o -name "*.jsx" | xargs sed -i.bak 's/:5000/:5001/g'

# 4. Clear build cache and node_modules
echo -e "${YELLOW}Clearing build cache and reinstalling dependencies...${NC}"
rm -rf node_modules/.cache
rm -rf build

# 5. Create new SocketContext.js
echo -e "${YELLOW}Creating new SocketContext.js...${NC}"
cat > SocketContext.js << 'EOFJS'
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

// HARDCODED URL - NO VARIABLES
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

# 6. Create .env file with correct environment variables
echo -e "${YELLOW}Creating .env file...${NC}"
cat > .env << 'EOF'
REACT_APP_BACKEND_URL=http://localhost:5001
PORT=3001
BROWSER=none
