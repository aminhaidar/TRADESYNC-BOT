#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting TradeSync Bot...${NC}"

# Kill any existing processes
echo -e "Killing any existing processes..."
pkill -f "node.*server.js" || true
pkill -f "npm start" || true

# Wait for processes to terminate
sleep 2

# Start backend
cd backend-node
echo -e "${GREEN}Starting backend server on port 5001...${NC}"
PORT=5001 node server.js &
BACKEND_PID=$!
echo -e "${GREEN}Backend started with PID: ${BACKEND_PID}${NC}"

# Wait for backend to initialize
echo -e "${YELLOW}Waiting for backend to initialize...${NC}"
sleep 3

# Start frontend
cd ../frontend
echo -e "${GREEN}Starting frontend...${NC}"
REACT_APP_BACKEND_URL=http://localhost:5001 PORT=3001 npm start

# If we get here, frontend exited
echo -e "${RED}Frontend process exited. Killing backend...${NC}"
kill $BACKEND_PID || true
