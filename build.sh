#!/usr/bin/env bash
# Build script for deployment

# Exit on error
set -e

# Debug information
echo "Python version:"
python --version
echo "Current directory: $(pwd)"

# Update apt and install system dependencies
apt-get update -y
apt-get install -y python3-dev python3-pip python3-setuptools python3-wheel python3-cffi python3-all-dev

# Create logs directory if it doesn't exist
mkdir -p logs

# Clear pip cache for good measure
pip cache purge

# Upgrade pip and essential packages
pip install --upgrade pip setuptools wheel

# Install packages that are known to have build issues first, using binary distributions when possible
pip install --only-binary=:all: aiohttp==3.8.5 multidict yarl 

# Install all other requirements
pip install -r requirements.txt

# Check if aiohttp was installed correctly
pip list | grep aiohttp

echo "Build completed successfully"