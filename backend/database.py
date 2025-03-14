import os
import sqlite3
import logging
from config import Config

logger = logging.getLogger(__name__)

def get_db_connection():
    """
    Create and return a database connection.
    """
    conn = sqlite3.connect(Config.DATABASE_URI.split("///")[1])
    conn.row_factory = sqlite3.Row
    return conn

def setup_database():
    """
    Set up the database schema if it doesn't exist.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                message TEXT NOT NULL,
                parsed_data TEXT,
                processed INTEGER DEFAULT 0
            )
        """)
        
        conn.commit()
        logger.info("Database setup completed successfully")
    except Exception as e:
        logger.error(f"Error setting up database: {str(e)}")
    finally:
        conn.close()