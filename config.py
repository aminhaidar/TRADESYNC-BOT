import os
import secrets

class Config:
    # Secret key for session management
    SECRET_KEY = os***REMOVED***iron.get('SECRET_KEY') or secrets.token_hex(16)
    
    # Debug mode
    DEBUG = os***REMOVED***iron.get('DEBUG') or True
    
    # Database settings
    DATABASE_URI = os***REMOVED***iron.get('DATABASE_URI') or 'trades.db'
    
    # Logging
    LOG_LEVEL = os***REMOVED***iron.get('LOG_LEVEL') or 'INFO'
    LOG_DIR = os***REMOVED***iron.get('LOG_DIR') or 'logs'
    
    # Discord integration
    DISCORD_WEBHOOK_URL = os***REMOVED***iron.get('DISCORD_WEBHOOK_URL')
    
    # Google OAuth settings
    GOOGLE_CLIENT_ID = os***REMOVED***iron.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os***REMOVED***iron.get('GOOGLE_CLIENT_SECRET')
    
    # Allow HTTP for local development
    OAUTHLIB_INSECURE_TRANSPORT = os***REMOVED***iron.get('OAUTHLIB_INSECURE_TRANSPORT', '1')
    
    # Application settings
    TRADES_PER_PAGE = 50