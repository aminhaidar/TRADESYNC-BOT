import sqlite3
import os
import sys

print("Python version:", sys.version)
print("Current working directory:", os.getcwd())

# Test both absolute and relative paths
db_paths = [
    # Relative path
    "trades.db",
    # Absolute path
    "/Users/amin.haidar/tradesync-bot/tradesync-bot-vite/backend/trades.db"
]

for db_path in db_paths:
    print(f"\nTesting connection to: {db_path}")
    try:
        # Ensure directory exists for absolute path
        if "/" in db_path and not db_path.startswith("./"):
            dir_path = os.path.dirname(db_path)
            if dir_path:
                os.makedirs(dir_path, exist_ok=True)
                print(f"Ensured directory exists: {dir_path}")
        
        # Try to connect
        conn = sqlite3.connect(db_path)
        print(f"Connected successfully to {db_path}")
        cursor = conn.cursor()
        
        # Create a test table
        cursor.execute("CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)")
        print("Created test table")
        
        # Insert test data
        cursor.execute("INSERT INTO test (name) VALUES (?)", ("test_entry",))
        conn.commit()
        print("Inserted test data")
        
        # Verify data
        cursor.execute("SELECT * FROM test")
        result = cursor.fetchall()
        print(f"Query results: {result}")
        
        # Clean up
        conn.close()
        print(f"✅ Successfully connected to {db_path}")
    except Exception as e:
        print(f"❌ Error with {db_path}: {e}")
