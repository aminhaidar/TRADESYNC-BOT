import os
import sqlite3
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def setup_database():
    """
    Initialize the SQLite database and create necessary tables
    """
    try:
        # Ensure logs directory exists
        os.makedirs('logs', exist_ok=True)

        # Connect to SQLite database
        conn = sqlite3.connect('trades.db')
        cursor = conn.cursor()

        # Create trades table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS trades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            trade_type TEXT NOT NULL,  # 'buy' or 'sell'
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        ''')

        # Create user table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        ''')

        # Commit changes and close connection
        conn.commit()
        conn.close()

        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization error: {str(e)}")

def log_trade(symbol, quantity, price, trade_type):
    """
    Log a trade to the database
    """
    try:
        conn = sqlite3.connect('trades.db')
        cursor = conn.cursor()
        
        cursor.execute('''
        INSERT INTO trades (symbol, quantity, price, trade_type) 
        VALUES (?, ?, ?, ?)
        ''', (symbol, quantity, price, trade_type))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Trade logged: {symbol} - {quantity} @ {price}")
    except Exception as e:
        logger.error(f"Error logging trade: {str(e)}")