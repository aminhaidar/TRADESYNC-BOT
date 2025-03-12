from app import app, socketio

# This creates a WSGI application that wraps the socketio app
application = socketio.make_wsgi_app(app)

# Callable for Gunicorn
def create_app():
    return application