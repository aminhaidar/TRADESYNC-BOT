#!/bin/bash

echo -e "Starting TradeSync Bot with Enhanced UI..."

# Kill any existing processes
pkill -f "node.*server.js" || true
pkill -f "npm start" || true
sleep 2

# Start backend
cd backend-node
echo -e "Starting backend server..."
PORT=5001 node server.js &

# Wait for backend to initialize
sleep 3

# Start frontend
cd ../frontend
echo -e "Starting frontend..."
npm start

