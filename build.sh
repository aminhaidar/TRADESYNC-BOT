#!/bin/bash

# Ensure the script exits immediately on error
set -e

# Update package list and install required system dependencies
apt-get update && apt-get install -y build-essential python3-dev

# Ensure pip is up to date
pip install --upgrade pip setuptools wheel

# Install project dependencies from requirements.txt
pip install -r requirements.txt
