#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting TradeSync Bot with Node.js Backend ===${NC}"

# Start the Node.js backend
echo -e "${YELLOW}Starting Node.js backend server...${NC}"
cd backend-node
node server.js &
BACKEND_PID=$!
echo -e "${GREEN}Backend started with PID: ${BACKEND_PID}${NC}"

# Wait for backend to be ready
echo "Waiting for backend to initialize..."
sleep 3

# Start the frontend development server in a new terminal
echo -e "${YELLOW}Starting React frontend...${NC}"
osascript -e 'tell app "Terminal" to do script "cd '$PWD'/frontend && npm start"'

echo -e "${BLUE}TradeSync Bot is now running!${NC}"
echo -e "${YELLOW}Backend URL: http://localhost:5000${NC}"
echo -e "${YELLOW}Frontend URL: http://localhost:3000${NC}"

# Keep this script running until Ctrl+C
echo -e "${YELLOW}Press Ctrl+C to stop the backend server${NC}"
wait $BACKEND_PID
