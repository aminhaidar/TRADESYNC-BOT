import os

class Config:
    # Secret key for session management
    SECRET_KEY = os***REMOVED***iron.get('SECRET_KEY') or 'your-super-secret-key-change-this-in-production'
    
    # Debug mode
    DEBUG = os***REMOVED***iron.get('DEBUG') or True
    
    # Database settings
    DATABASE_URI = os***REMOVED***iron.get('DATABASE_URI') or 'trades.db'
    
    # Logging
    LOG_LEVEL = os***REMOVED***iron.get('LOG_LEVEL') or 'INFO'
    LOG_DIR = os***REMOVED***iron.get('LOG_DIR') or 'logs'
    
    # Discord integration
    DISCORD_WEBHOOK_URL = os***REMOVED***iron.get('DISCORD_WEBHOOK_URL')
    
    # Application settings
    TRADES_PER_PAGE = 50
