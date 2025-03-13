import sqlite3
import os
import logging

logger = logging.getLogger(__name__)

def setup_database():
    """
    Initializes the SQLite database.
    """
    try:
        os.makedirs("logs", exist_ok=True)
        conn = sqlite3.connect("trades.db")
        cursor = conn.cursor()

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                parsed_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS stock_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                price REAL,
                change_percent REAL,
                volume INTEGER,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization error: {str(e)}")

def get_db_connection():
    """
    Get a connection to the SQLite database.
    """
    conn = sqlite3.connect("trades.db")
    conn.row_factory = sqlite3.Row
    return conn
