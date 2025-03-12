from app import app

# For Flask-SocketIO with Gunicorn, we use the application directly
# This is the WSGI entry point
application = app

# Instead of returning the application from a function,
# we can just assign the application to a variable
# and Gunicorn will use it directly