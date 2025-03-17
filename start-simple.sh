#!/bin/bash

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}TradeSync Bot Startup${NC}"

# Kill any existing processes on ports 5000, 5001, and 3000
echo -e "Killing any processes using ports 5000, 5001, and 3000..."
lsof -ti:5000,5001,3000 | xargs kill -9 2>/dev/null || true
sleep 2

# Start backend server
echo -e "Starting backend server on port 5001..."
cd backend-node
node server.js &
BACKEND_PID=$!
echo -e "${GREEN}Backend started with PID: ${BACKEND_PID}${NC}"

# Wait for backend to initialize
echo "Waiting for backend to initialize..."
sleep 3

# Start frontend server on port 3001
echo -e "Starting frontend server on port 3001..."
cd ../frontend
PORT=3001 REACT_APP_BACKEND_URL=http://localhost:5001 npm start &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend started with PID: ${FRONTEND_PID}${NC}"

echo -e "${GREEN}TradeSync Bot is running:${NC}"
echo -e "Backend: http://localhost:5001"
echo -e "Frontend: http://localhost:3001"

# Wait for either process to exit
wait $BACKEND_PID $FRONTEND_PID
