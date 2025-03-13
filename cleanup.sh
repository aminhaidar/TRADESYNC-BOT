#!/bin/bash

# Project Cleanup Script for TradeSync Bot

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${GREEN}[CLEANUP]${NC} $1"
}

# Function to print error messages
print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Cleanup Python-related files and directories
cleanup_python() {
    print_status "Cleaning up Python-related files..."
    
    # Remove Python cache files
    find . -type d -name "__pycache__" -exec rm -rf {} +
    find . -type f -name "*.pyc" -delete
    find . -type f -name "*.pyo" -delete
    find . -type f -name "*.pyd" -delete

    # Remove virtual environment
    if [ -d "venv" ]; then
        print_status "Removing virtual environment..."
        rm -rf venv
    fi

    # Remove log files
    if [ -d "logs" ]; then
        print_status "Removing log files..."
        rm -rf logs
    fi
}

# Cleanup Node.js related files and directories
cleanup_nodejs() {
    print_status "Cleaning up Node.js related files..."
    
    # Remove node modules
    if [ -d "node_modules" ]; then
        print_status "Removing node_modules directory..."
        rm -rf node_modules
    fi

    # Remove package lock files
    rm -f package-lock.json
    rm -f yarn.lock

    # Clear npm cache
    npm cache clean --force
}

# Cleanup build and distribution files
cleanup_build() {
    print_status "Cleaning up build and distribution files..."
    
    # Remove build directories
    rm -rf build
    rm -rf dist
    rm -rf .next
    rm -rf out
}

# Cleanup IDE and system files
cleanup_system() {
    print_status "Cleaning up system and IDE files..."
    
    # Remove Mac-specific files
    find . -type f -name ".DS_Store" -delete
    find . -type f -name "._*" -delete

    # Remove editor-specific files
    rm -rf .vscode
    rm -rf .idea
    rm -rf *.sublime-project
    rm -rf *.sublime-workspace
}

# Cleanup environment files
cleanup_env() {
    print_status "Cleaning up environment files..."
    
    # Remove .env files (be cautious!)
    rm -f .env
    rm -f .env.local
    rm -f .env.development
    rm -f .env.production
}

# Main cleanup function
main_cleanup() {
    echo -e "${YELLOW}TradeSync Bot Project Cleanup${NC}"
    
    # Confirm cleanup
    read -p "Are you sure you want to clean up the project? (y/N): " confirm
    if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
        print_error "Cleanup cancelled."
        exit 1
    fi

    cleanup_python
    cleanup_nodejs
    cleanup_build
    cleanup_system
    cleanup_env

    print_status "Cleanup completed successfully!"
}

# Run the cleanup
main_cleanup