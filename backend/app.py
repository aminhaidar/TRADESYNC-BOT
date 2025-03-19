from flask import Flask, request, jsonify
import sqlite3
import os
import json
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Database connection helper
def get_db_connection():
    db_path = os.environ.get('DB_PATH', '/tmp/tradesync.db')
    return sqlite3.connect(db_path)

# Initialize the notifications table
def init_notifications_table():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT,
            content TEXT,
            timestamp DATETIME,
            raw_data TEXT
        )
    ''')
    conn.commit()
    conn.close()

# Initialize the database (both tables)
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    # Create insights table (existing)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS insights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticker TEXT,
            category TEXT,
            subcategory TEXT,
            sentiment TEXT,
            summary TEXT,
            confidence REAL,
            source TEXT,
            timestamp TEXT,
            closed INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()
    # Create notifications table
    init_notifications_table()

@app.route("/")
def home():
    return "TradeSync Bot API", 200

def call_grok_api(post_text, source, timestamp, image_url=None):
    if "$" in post_text:
        ticker = next((word for word in post_text.split() if word.startswith("$")), "N/A")
        if "buy" in post_text.lower() or "sell" in post_text.lower():
            category = "Actionable Trade"
            subcategory = ""
            sentiment = ""
            summary = f"Trade suggestion for {ticker}."
            confidence = 85.0
        elif "short" in post_text.lower() or "breakout" in post_text.lower():
            category = "AI Insight"
            subcategory = ""
            sentiment = "Bearish" if "short" in post_text.lower() else "Bullish"
            summary = f"{sentiment} sentiment on {ticker} based on market signal."
            confidence = 80.0
        else:
            category = "General Insight"
            subcategory = "Community/Noise"
            sentiment = ""
            summary = f"General comment about {ticker}."
            confidence = 30.0
    else:
        ticker = "N/A"
        category = "General Insight"
        subcategory = "Education" if "means" in post_text.lower() else "Community/Noise"
        sentiment = ""
        summary = "General trading discussion."
        confidence = 60.0 if "means" in post_text.lower() else 10.0

    return {
        "ticker": ticker,
        "category": category,
        "subcategory": subcategory,
        "sentiment": sentiment,
        "summary": summary,
        "confidence": confidence,
        "source": source,
        "timestamp": timestamp
    }

@app.route('/webhook', methods=['POST'])
def webhook():
    try:
        data = request.get_json()
        if not data or 'text' not in data or 'source' not in data or 'timestamp' not in data:
            return jsonify({"error": "Invalid payload"}), 400
        
        post_text = data.get('text', '')
        source = data.get('source', 'Unknown')
        timestamp = data.get('timestamp', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

        # Open a database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Store raw notification data in the notifications table
        cursor.execute('''
            INSERT INTO notifications (source, content, timestamp, raw_data)
            VALUES (?, ?, ?, ?)
        ''', (source, post_text, timestamp, json.dumps(data)))

        # Generate insight data
        insight_data = call_grok_api(post_text, source, timestamp)

        # Insert insight into the insights table
        cursor.execute('''
            INSERT INTO insights (ticker, category, subcategory, sentiment, summary, confidence, source, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            insight_data['ticker'],
            insight_data['category'],
            insight_data.get('subcategory', ''),
            insight_data.get('sentiment', ''),
            insight_data['summary'],
            insight_data['confidence'],
            insight_data['source'],
            insight_data['timestamp']
        ))

        # Commit changes and close the connection
        conn.commit()
        conn.close()
        
        return 'Webhook received', 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/insights', methods=['GET'])
def get_insights():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Ensure the closed column exists
        cursor.execute("PRAGMA table_info(insights)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'closed' not in columns:
            cursor.execute('ALTER TABLE insights ADD COLUMN closed INTEGER DEFAULT 0')
            conn.commit()
        
        cursor.execute('SELECT * FROM insights WHERE closed = 0 OR closed IS NULL ORDER BY id DESC LIMIT 10')
        rows = cursor.fetchall()
        conn.close()

        insights = [
            {
                "id": row[0],
                "ticker": row[1],
                "category": row[2],
                "subcategory": row[3],
                "sentiment": row[4],
                "summary": row[5],
                "confidence": row[6],
                "source": row[7],
                "timestamp": row[8],
                "closed": row[9] if len(row) > 9 else 0
            } for row in rows
        ]
        return jsonify(insights)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/insights/close/<int:insight_id>', methods=['POST'])
def close_insight(insight_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT id FROM insights WHERE id = ?', (insight_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({"error": "Insight not found"}), 404
        
        cursor.execute('UPDATE insights SET closed = 1 WHERE id = ?', (insight_id,))
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "message": f"Insight {insight_id} closed successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/insights/closed', methods=['GET'])
def get_closed_insights():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM insights WHERE closed = 1 ORDER BY id DESC LIMIT 10')
        rows = cursor.fetchall()
        conn.close()

        insights = [
            {
                "id": row[0],
                "ticker": row[1],
                "category": row[2],
                "subcategory": row[3],
                "sentiment": row[4],
                "summary": row[5],
                "confidence": row[6],
                "source": row[7],
                "timestamp": row[8],
                "closed": row[9] if len(row) > 9 else 0
            } for row in rows
        ]
        return jsonify(insights)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Initialize the database when the app starts
    init_db()
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)