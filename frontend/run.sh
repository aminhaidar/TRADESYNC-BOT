#!/bin/bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
npm install

# Build frontend
npm run build

# Start backend with Gunicorn
gunicorn --worker-class gevent -w 4 wsgi:application
