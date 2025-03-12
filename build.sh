#!/usr/bin/env bash
# Build script for Render.com deployment

# Exit on error
set -e

# Debug information
echo "Python version:"
python --version
echo "Current directory: $(pwd)"

# Create logs directory if it doesn't exist
mkdir -p logs

# Upgrade pip
pip install --upgrade pip setuptools wheel

# Install dependencies specifically in order to handle version conflicts
pip install aiohttp==3.8.1
pip install -r requirements.txt

# Verify installation
echo "Checking installed packages:"
pip list | grep aiohttp

echo "Build completed successfully"