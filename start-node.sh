#!/bin/bash

# Terminal colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting TradeSync Bot with Node.js Backend ===${NC}"

# Check if Node.js and npm are installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Node.js/npm is not installed. Please install Node.js to continue.${NC}"
    exit 1
fi

# Start the Node.js backend
echo -e "${YELLOW}Starting Node.js backend server...${NC}"
cd backend-node
npm start &
BACKEND_PID=$!
echo -e "${GREEN}Backend started with PID: ${BACKEND_PID}${NC}"

# Wait for backend to be ready
echo "Waiting for backend to initialize..."
sleep 3

# Start the frontend development server
echo -e "${YELLOW}Starting React frontend...${NC}"
cd ../frontend
npm start &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend started with PID: ${FRONTEND_PID}${NC}"

echo -e "${BLUE}TradeSync Bot is now running!${NC}"
echo -e "${YELLOW}Backend URL: http://localhost:5000${NC}"
echo -e "${YELLOW}Frontend URL: http://localhost:3000${NC}"

# Function to handle script termination
cleanup() {
    echo -e "${YELLOW}Shutting down TradeSync Bot...${NC}"
    kill $BACKEND_PID $FRONTEND_PID
    echo -e "${GREEN}Services stopped.${NC}"
    exit 0
}

# Register cleanup function for script termination
trap cleanup SIGINT SIGTERM

# Keep script running
wait
