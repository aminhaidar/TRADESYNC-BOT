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

# Upgrade pip and specify the index to use
pip install --upgrade pip setuptools wheel

# Try to install a pre-built wheel from PyPI for aiohttp
echo "Attempting to install aiohttp using pre-built wheel..."
pip install --only-binary=:all: aiohttp==3.8.1

# Install the rest of the dependencies
pip install -r requirements.txt --no-deps --only-binary=:all: alpaca-trade-api

# Install any remaining dependencies
pip install -r requirements.txt

# Verify installation
echo "Checking installed packages:"
pip list | grep aiohttp
pip list | grep alpaca

echo "Build completed successfully"