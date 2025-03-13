import os
import sys

# Add project root to Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Import Flask application
from app import app, socketio

# Gunicorn application
application = app

# Development run
if __name__ == "__main__":
    socketio.run(app, debug=True)