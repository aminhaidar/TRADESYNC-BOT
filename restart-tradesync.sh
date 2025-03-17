#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping any running processes...${NC}"
pkill -f "node.*server.js" || true
pkill -f "react-scripts" || true
sleep 2

echo -e "${YELLOW}Starting backend server on port 5001...${NC}"
cd backend-node
PORT=5001 node server.js &
BACKEND_PID=$!

echo -e "${YELLOW}Starting frontend on port 3001...${NC}"
cd ../frontend
PORT=3001 npm start

# Keep script running
wait
