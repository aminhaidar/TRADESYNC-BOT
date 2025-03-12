import sqlite3
import os
from utils.logger import setup_logger

logger = setup_logger('database', 'database.log')

class Database:
    def __init__(self, db_path='trades.db'):
        self.db_path = db_path
        self.conn = None
        self.create_tables_if_not_exist()
    
    def get_connection(self):
        """Get a database connection"""
        if self.conn is None:
            try:
                self.conn = sqlite3.connect(self.db_path)
                self.conn.row_factory = sqlite3.Row
                return self.conn
            except sqlite3.Error as e:
                logger.error(f"Database connection error: {e}")
                raise
        return self.conn
    
    def close_connection(self):
        """Close the database connection"""
        if self.conn:
            self.conn.close()
            self.conn = None
    
    def create_tables_if_not_exist(self):
        """Create necessary tables if they don't exist"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Create trades table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS trades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT NOT NULL,
            price REAL NOT NULL,
            quantity INTEGER NOT NULL,
            trade_type TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            source TEXT,
            user_id INTEGER
        )
        ''')
        
        # Create discord_messages table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS discord_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            processed BOOLEAN DEFAULT 0
        )
        ''')
        
        # Create users table with google_id
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            google_id TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        conn.commit()
        
    def execute_query(self, query, params=None):
        """Execute a query and return the results"""
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            conn.commit()
            return cursor
        except sqlite3.Error as e:
            conn.rollback()
            logger.error(f"Query execution error: {e}")
            raise

# Create a singleton instance
db = Database()