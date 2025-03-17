#!/bin/bash
# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Kill existing processes
echo -e "${YELLOW}Killing any processes on ports 5000 and 5001...${NC}"
pkill -f "node.*5000" || true
pkill -f "node.*5001" || true
sleep 2

echo -e "${BLUE}=== Starting TradeSync Bot with Node.js Backend ===${NC}"

# Start the backend server on port 5001
echo -e "${YELLOW}Starting Node.js backend server on port 5001...${NC}"
cd backend-node
PORT=5001 node server.js &
BACKEND_PID=$!
echo -e "${GREEN}Backend started with PID: ${BACKEND_PID}${NC}"

# Wait for backend to be ready
echo "Waiting for backend to initialize..."
sleep 5

# Start the frontend development server
echo -e "${YELLOW}Starting React frontend...${NC}"
cd ../frontend

# Create a .env file to set the API URL
echo "REACT_APP_BACKEND_URL=http://localhost:5001" > .env

# Start the frontend in a new terminal
osascript -e 'tell app "Terminal" to do script "cd '$PWD' && npm start"'

echo -e "${BLUE}TradeSync Bot is now running!${NC}"
echo -e "${YELLOW}Backend URL: http://localhost:5001${NC}"
echo -e "${YELLOW}Frontend URL: http://localhost:3000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the backend server${NC}"

wait $BACKEND_PID
