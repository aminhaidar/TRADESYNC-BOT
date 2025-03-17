#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Performing a full reset of TradeSync Bot...${NC}"

# Kill any existing processes
echo -e "${YELLOW}Killing any existing processes...${NC}"
pkill -f "node.*server.js" || true
pkill -f "react-scripts" || true
lsof -ti:3000,3001,5000,5001 | xargs kill -9 2>/dev/null || true
sleep 2

# Clear browser cache (instructions)
echo -e "${RED}IMPORTANT: Please clear your browser cache or open a new incognito window${NC}"
echo -e "${YELLOW}Press Enter when ready...${NC}"
read

# Start backend server
echo -e "${YELLOW}Starting backend server on port 5001...${NC}"
cd backend-node

# Ensure backend is configured for port 5001
sed -i.bak 's/const PORT = process.env.PORT || 5000;/const PORT = 5001;/g' server.js
sed -i.bak 's/const PORT = 5000;/const PORT = 5001;/g' server.js

# Start server
PORT=5001 node server.js &
BACKEND_PID=$!
echo -e "${GREEN}Backend started with PID: ${BACKEND_PID}${NC}"

# Wait for backend to initialize
echo -e "${YELLOW}Waiting for backend to initialize...${NC}"
sleep 3

# Start frontend
echo -e "${YELLOW}Starting frontend on port 3001...${NC}"
cd ../frontend

# Clear React cache
echo -e "${YELLOW}Clearing React cache...${NC}"
rm -rf node_modules/.cache

# Start frontend
PORT=3001 npm start

# If we get here, the process has exited
echo -e "${RED}Frontend process exited. Killing backend...${NC}"
kill $BACKEND_PID || true
