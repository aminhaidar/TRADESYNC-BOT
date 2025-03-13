# This is the entry point for Gunicorn when deploying to Render
# Import the Flask app and make it available as 'application'

from app import app as application

if __name__ == "__main__":
    application.run()