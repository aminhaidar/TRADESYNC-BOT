#!/bin/bash
# Kill any existing processes
pkill -f "node server.js" || true

# Start server
node server.js
