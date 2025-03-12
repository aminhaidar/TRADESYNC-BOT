#!/usr/bin/env bash
# Build script for Render.com deployment with latest Alpaca version

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

# Install aiohttp directly first
echo "Installing aiohttp..."
pip install aiohttp==3.8.5

# Install latest alpaca-trade-api
echo "Installing latest alpaca-trade-api..."
pip install alpaca-trade-api --upgrade

# Install remaining dependencies
echo "Installing remaining requirements..."
pip install -r requirements.txt

# Show the installed package versions
echo "Installed package versions:"
pip list | grep aiohttp
pip list | grep alpaca

echo "Build completed successfully"