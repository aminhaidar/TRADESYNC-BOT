from app import app, socketio

# For Flask-SocketIO, we simply return the app when using Gunicorn
# The socketio instance is already attached to the app
application = app

# Callable for Gunicorn
def create_app():
    return application