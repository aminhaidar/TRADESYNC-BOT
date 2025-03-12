import sqlite3
import os
import threading
from utils.logger import app_logger as logger

# Define the database path
DATABASE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "tradesync.db")

# Thread-local storage for database connections
_local = threading.local()

class Database:
    def initialize_db(self):
        """Initialize the database with required tables if they don't exist"""
        try:
            # Create database directory if it doesn't exist
            os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
            
            # Get a connection
            conn = self.get_db_connection()
            
            # Create users table
            conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT UNIQUE,
                password_hash TEXT,
                google_id TEXT UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            
            # Create trades table
            conn.execute("""
            CREATE TABLE IF NOT EXISTS trades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                symbol TEXT NOT NULL,
                price REAL,
                quantity INTEGER,
                trade_type TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                source TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
            """)
            
            # Create strategies table
            conn.execute("""
            CREATE TABLE IF NOT EXISTS strategies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                name TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
            """)
            
            # Create portfolios table
            conn.execute("""
            CREATE TABLE IF NOT EXISTS portfolios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                name TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
            """)
            
            conn.commit()
            logger.info("Database initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
            raise e

    def get_db_connection(self):
        """Get a connection to the database"""
        # Use thread-local storage for connections
        if not hasattr(_local, "connection"):
            # Connect with check_same_thread=False to avoid threading issues
            _local.connection = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
            _local.connection.row_factory = sqlite3.Row
        
        return _local.connection

    def close_db_connection(self):
        """Close the database connection if it exists"""
        if hasattr(_local, "connection"):
            _local.connection.close()
            delattr(_local, "connection")

    def execute_query(self, query, params=(), fetch_one=False, commit=False):
        """Execute a SQL query and optionally return results"""
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(query, params)
            
            if commit:
                conn.commit()
            
            if fetch_one:
                return cursor.fetchone()
            else:
                return cursor.fetchall()
        except Exception as e:
            logger.error(f"Database error: {e}")
            if commit:
                conn.rollback()
            raise e
        finally:
            cursor.close()

    def insert_row(self, table, data):
        """Insert a row into a table and return the ID"""
        columns = ", ".join(data.keys())
        placeholders = ", ".join(["?"] * len(data))
        values = tuple(data.values())
        
        query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
        
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(query, values)
            conn.commit()
            return cursor.lastrowid
        except Exception as e:
            logger.error(f"Error inserting into {table}: {e}")
            conn.rollback()
            raise e
        finally:
            cursor.close()

    def update_row(self, table, data, condition):
        """Update rows in a table that match the condition"""
        set_clause = ", ".join([f"{key} = ?" for key in data.keys()])
        where_clause = " AND ".join([f"{key} = ?" for key in condition.keys()])
        
        query = f"UPDATE {table} SET {set_clause} WHERE {where_clause}"
        values = tuple(list(data.values()) + list(condition.values()))
        
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(query, values)
            conn.commit()
            return cursor.rowcount
        except Exception as e:
            logger.error(f"Error updating {table}: {e}")
            conn.rollback()
            raise e
        finally:
            cursor.close()

    def delete_row(self, table, condition):
        """Delete rows from a table that match the condition"""
        where_clause = " AND ".join([f"{key} = ?" for key in condition.keys()])
        values = tuple(condition.values())
        
        query = f"DELETE FROM {table} WHERE {where_clause}"
        
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(query, values)
            conn.commit()
            return cursor.rowcount
        except Exception as e:
            logger.error(f"Error deleting from {table}: {e}")
            conn.rollback()
            raise e
        finally:
            cursor.close()

# Create a single instance of the Database class
db = Database()

# Initialize the database when the module is imported
try:
    db.initialize_db()
except Exception as e:
    logger.critical(f"Failed to initialize database: {e}")