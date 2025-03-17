#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}TradeSync Bot Socket Connection Fix${NC}"

# Step 1: Check if backend is running
echo -e "Checking if backend is running on port 5001..."
if nc -z localhost 5001; then
  echo -e "${GREEN}Backend detected on port 5001${NC}"
else
  echo -e "${RED}No service detected on port 5001!${NC}"
  echo -e "Please start your backend server on port 5001 first."
  exit 1
fi

# Step 2: Test socket connection
echo -e "\n${YELLOW}Testing direct socket connection to port 5001...${NC}"
cd socket-test
npm install
node socket-test.js

# Step 3: Replace SocketContext with fixed version
echo -e "\n${YELLOW}Backing up existing SocketContext.js...${NC}"
cd ../frontend/src/context
cp SocketContext.js SocketContext.js.bak

echo -e "${YELLOW}Installing fixed SocketContext.js...${NC}"
cp SocketContext.js.new SocketContext.js

echo -e "${GREEN}Socket context has been updated to explicitly use port 5001.${NC}"
echo -e "Please restart your frontend application now with:"
echo -e "${YELLOW}cd ~/tradesync-bot/frontend && npm start${NC}"
