import os
import sys

# Add project root to Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import socketio, app

if __name__ == "__main__":
    socketio.run(app, debug=True)