#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Create database tables
python -c "from utils.db import db; db.create_tables_if_not_exist()"
