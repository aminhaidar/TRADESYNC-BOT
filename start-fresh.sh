#!/bin/bash
# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
  lsof -i:$1 >/dev/null 2>&1
  return $?
}

echo -e "${BLUE}=== Starting TradeSync Bot with Node.js Backend ===${NC}"

# Kill any running processes on ports 5000 and 5001
echo -e "${YELLOW}Ensuring no conflicting processes are running...${NC}"
if check_port 5001; then
  echo -e "${RED}Port 5001 is in use. Killing process...${NC}"
  lsof -ti:5001 | xargs kill -9
  sleep 2
fi

# Start the Node.js backend with a modified port
echo -e "${YELLOW}Starting Node.js backend server on port 5001...${NC}"
cd backend-node
node server.js &
BACKEND_PID=$!
echo -e "${GREEN}Backend started with PID: ${BACKEND_PID}${NC}"

# Wait for backend to be ready
echo "Waiting for backend to initialize..."
sleep 3

# Start the frontend development server in a new terminal
echo -e "${YELLOW}Starting React frontend...${NC}"
cd ../frontend

# Start the frontend in a new terminal
osascript -e 'tell app "Terminal" to do script "cd '$PWD' && npm start"'

echo -e "${BLUE}TradeSync Bot is now running!${NC}"
echo -e "${YELLOW}Backend URL: http://localhost:5001${NC}"
echo -e "${YELLOW}Frontend URL: http://localhost:3000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the backend server${NC}"

wait $BACKEND_PID
