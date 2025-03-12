#!/bin/bash

# Ensure script exits on failure
set -e

# Install necessary system dependencies for building Python packages
apt-get update && apt-get install -y \
    python3-dev \
    gcc \
    g++ \
    libssl-dev \
    libffi-dev \
    build-essential

# Ensure pip and setuptools are up to date
pip install --upgrade pip setuptools wheel

# Install dependencies
pip install -r requirements.txt
