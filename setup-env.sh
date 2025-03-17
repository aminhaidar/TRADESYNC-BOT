#!/bin/bash
# Create proper .env files for both frontend and backend

# Frontend .env
cat > frontend/.env << 'END_FRONTEND'
PORT=3003
REACT_APP_BACKEND_URL=http://localhost:5001
END_FRONTEND

# Backend .env
cat > backend-node/.env << 'END_BACKEND'
PORT=5001
END_BACKEND

echo "Environment files created successfully!"
echo "To start your application:"
echo "  1. cd backend-node && node server.js"
echo "  2. cd frontend && npm start"
