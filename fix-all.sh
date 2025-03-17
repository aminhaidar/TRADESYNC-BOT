#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fixing TradeSync Bot connection issues...${NC}"

# 1. Kill any existing processes
echo -e "Killing any existing processes..."
pkill -f "node.*server.js" || true
pkill -f "npm start" || true

# 2. Wait for processes to terminate
sleep 2

# 3. First, fix any hardcoded URLs
echo -e "${YELLOW}Searching for hardcoded URLs...${NC}"

cd ~/tradesync-bot/frontend/src

# Find any files with hardcoded localhost:5000
HARDCODED_FILES=$(grep -r "localhost:5000" --include="*.js" --include="*.jsx" . | cut -d: -f1 | sort | uniq)

if [ -n "$HARDCODED_FILES" ]; then
  echo -e "${YELLOW}Found hardcoded URLs in these files:${NC}"
  echo "$HARDCODED_FILES"
  
  # Fix each file
  for file in $HARDCODED_FILES; do
    echo -e "${GREEN}Fixing $file...${NC}"
    # Make a backup
    cp "$file" "${file}.bak"
    # Replace all instances of localhost:5000 with localhost:5001
    sed -i '' 's/localhost:5000/localhost:5001/g' "$file"
  done
else
  echo -e "${GREEN}No more hardcoded URLs found.${NC}"
fi

# 4. Start backend
cd ~/tradesync-bot/backend-node
echo -e "${GREEN}Starting backend server on port 5001...${NC}"
PORT=5001 node server.js &
BACKEND_PID=$!
echo -e "${GREEN}Backend started with PID: ${BACKEND_PID}${NC}"

# 5. Wait for backend to initialize
echo -e "${YELLOW}Waiting for backend to initialize...${NC}"
sleep 3

# 6. Start frontend with fixed environment
cd ~/tradesync-bot/frontend
echo -e "${GREEN}Starting frontend with explicit backend URL...${NC}"
REACT_APP_BACKEND_URL=http://localhost:5001 PORT=3002 npm start

# 7. If we get here, frontend exited
echo -e "${RED}Frontend process exited. Killing backend...${NC}"
kill $BACKEND_PID || true
