import sqlite3
import os

def setup_database():
    """Initialize the SQLite database with required tables"""
    
    # Check if database already exists
    db_exists = os.path.exists('trades.db')
    
    # Connect to the database (creates it if it doesn't exist)
    conn = sqlite3.connect('trades.db')
    cursor = conn.cursor()
    
    print(f"Setting up database {'(new)' if not db_exists else '(existing)'}")
    
    # Create alerts table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        alert TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        parsed_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    print("- Created alerts table")
    
    # Create stock_data table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS stock_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        price REAL,
        change_percent REAL,
        volume INTEGER,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    print("- Created stock_data table")
    
    # Create index on symbol for better query performance
    cursor.execute('''
    CREATE INDEX IF NOT EXISTS idx_stock_symbol ON stock_data(symbol)
    ''')
    print("- Created index on stock_data.symbol")
    
    # Create indices table for market indices
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS indices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        name TEXT,
        price REAL,
        change_percent REAL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    print("- Created indices table")
    
    # Insert or update default indices
    indices = [
        ("^VIX", "Volatility Index"),
        ("^GSPC", "S&P 500"),
        ("^NDX", "NASDAQ-100"),
        ("^DJI", "Dow Jones Industrial Average"),
        ("^RUT", "Russell 2000")
    ]
    
    for symbol, name in indices:
        cursor.execute('''
        INSERT OR IGNORE INTO indices (symbol, name) VALUES (?, ?)
        ''', (symbol, name))
    
    print(f"- Added default market indices: {len(indices)}")
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    
    print("Database setup complete!")

if __name__ == "__main__":
    setup_database()