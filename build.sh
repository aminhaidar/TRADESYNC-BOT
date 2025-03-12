#!/usr/bin/env bash
# Optimized build script for Render.com deployment

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

# First install a compatible aiohttp version
echo "Installing aiohttp..."
pip install --prefer-binary aiohttp==3.8.5

# Install alpaca-trade-api without dependencies 
echo "Installing alpaca-trade-api without dependencies..."
pip install alpaca-trade-api==3.0.0 --no-dependencies

# Install remaining requirements
echo "Installing remaining packages..."
pip install -r requirements.txt --no-dependencies  # Skip installing dependencies

# Final pass to ensure all dependencies are installed
echo "Ensuring all dependencies are installed..."
pip install -r requirements.txt

# Verify installation
echo "Checking installed packages:"
pip list | grep aiohttp
pip list | grep alpaca

echo "Build completed successfully"