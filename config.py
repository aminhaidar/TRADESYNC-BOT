import os
import secrets

class Config:
    # Secret key for session management
    SECRET_KEY = os.environ.get('SECRET_KEY') or secrets.token_hex(16)
    
    # Debug mode
    DEBUG = os.environ.get('DEBUG') or True
    
    # Database settings
    DATABASE_URI = os.environ.get('DATABASE_URI') or 'trades.db'
    
    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL') or 'INFO'
    LOG_DIR = os.environ.get('LOG_DIR') or 'logs'
    
    # Discord integration
    DISCORD_WEBHOOK_URL = os.environ.get('DISCORD_WEBHOOK_URL')
    
    # Google OAuth settings
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    
    # Allow HTTP for local development
    OAUTHLIB_INSECURE_TRANSPORT = os.environ.get('OAUTHLIB_INSECURE_TRANSPORT', '1')
    
    # Application settings
    TRADES_PER_PAGE = 50