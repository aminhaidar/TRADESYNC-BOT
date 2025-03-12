#!/usr/bin/env bash
# Build script for Render.com deployment with read-only filesystem

# Exit on error
set -e

# Debug information
echo "Python version:"
python --version
echo "Current directory: $(pwd)"

# Create logs directory if it doesn't exist
mkdir -p logs

# Skip system package installation on Render (read-only filesystem)
# Instead, use pip to install required packages

# Upgrade pip and essential packages
pip install --upgrade pip setuptools wheel

# Install packages that are known to have build issues first
# Using binary distributions when possible
pip install --only-binary=:all: multidict yarl cchardet 

# Install aiohttp separately with specific options
pip install aiohttp==3.8.5 --no-build-isolation

# Install all other requirements
pip install -r requirements.txt

# List installed packages for debugging
echo "Checking installed packages:"
pip list | grep aiohttp
pip list | grep multidict
pip list | grep yarl

echo "Build completed successfully"