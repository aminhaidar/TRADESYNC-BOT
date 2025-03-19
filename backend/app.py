from flask import Flask, request, jsonify
import sqlite3
import os
import json
from datetime import datetime
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables for configuration
DB_PATH = os.environ.get('DATABASE_URL', '/tmp/tradesync.db')
MAX_INSIGHTS_LIMIT = int(os.environ.get('MAX_INSIGHTS_LIMIT', 10))

# Database connection helper with timeout
def get_db_connection():
    try:
        conn = sqlite3.connect(DB_PATH, timeout=10)  # Add timeout to prevent database locked errors
        conn.row_factory = sqlite3.Row  # Enable row factory for easier column access
        return conn
    except sqlite3.OperationalError as e:
        logger.error(f"Database connection error: {str(e)}")
        raise

# Initialize the notifications table
def init_notifications_table():
    try:
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
        logger.info("Notifications table initialized")
    except Exception as e:
        logger.error(f"Error initializing notifications table: {str(e)}")
        raise
    finally:
        conn.close()

# Initialize the database (both tables)
def init_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
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
        logger.info("Insights table initialized")
    except Exception as e:
        logger.error(f"Error initializing insights table: {str(e)}")
        raise
    finally:
        conn.close()
    init_notifications_table()

# Initialize database at app startup
with app.app_context():
    init_db()

@app.route("/")
def home():
    return "TradeSync Bot API", 200

@app.route('/health', methods=['GET'])
def health_check():
    try:
        conn = get_db_connection()
        conn.cursor().execute('SELECT 1')
        conn.close()
        return jsonify({"status": "healthy"}), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

def call_grok_api(post_text, source, timestamp, image_url=None):
    try:
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
    except Exception as e:
        logger.error(f"Error in call_grok_api: {str(e)}")
        raise

@app.route('/webhook', methods=['POST'])
def webhook():
    try:
        data = request.get_json()
        logger.info(f"Received payload: {data}")
        if not data:
            logger.warning("No JSON data received")
            return jsonify({"error": "No JSON data provided"}), 400
        
        post_text = data.get('text', '')
        source = data.get('source', 'Unknown')
        timestamp = data.get('timestamp', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        
        if not post_text:
            logger.warning("Missing 'text' field in payload")
            return jsonify({"error": "Missing 'text' field"}), 400
        
        logger.info(f"Processing notification: source={source}, content={post_text}, timestamp={timestamp}")
        
        # Store the notification
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO notifications (source, content, timestamp, raw_data)
            VALUES (?, ?, ?, ?)
        ''', (source, post_text, timestamp, json.dumps(data)))
        conn.commit()
        logger.info("Notification stored in database")
        
        # Generate and store insight
        insight_data = call_grok_api(post_text, source, timestamp)
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
        conn.commit()
        logger.info("Insight generated and stored")
        conn.close()
        
        return 'Webhook received', 200
    except Exception as e:
        logger.error(f"Error in webhook: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/insights', methods=['GET'])
def get_insights():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("PRAGMA table_info(insights)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'closed' not in columns:
            cursor.execute('ALTER TABLE insights ADD COLUMN closed INTEGER DEFAULT 0')
            conn.commit()
            logger.info("Added 'closed' column to insights table")
        
        cursor.execute('SELECT * FROM insights WHERE closed = 0 OR closed IS NULL ORDER BY id DESC LIMIT ?', (MAX_INSIGHTS_LIMIT,))
        rows = cursor.fetchall()
        
        insights = [
            {
                "id": row['id'],
                "ticker": row['ticker'],
                "category": row['category'],
                "subcategory": row['subcategory'],
                "sentiment": row['sentiment'],
                "summary": row['summary'],
                "confidence": row['confidence'],
                "source": row['source'],
                "timestamp": row['timestamp'],
                "closed": row['closed']
            } for row in rows
        ]
        conn.close()
        return jsonify(insights)
    except Exception as e:
        logger.error(f"Error in get_insights: {str(e)}")
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
        logger.error(f"Error in close_insight: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/insights/closed', methods=['GET'])
def get_closed_insights():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM insights WHERE closed = 1 ORDER BY id DESC LIMIT ?', (MAX_INSIGHTS_LIMIT,))
        rows = cursor.fetchall()
        
        insights = [
            {
                "id": row['id'],
                "ticker": row['ticker'],
                "category": row['category'],
                "subcategory": row['subcategory'],
                "sentiment": row['sentiment'],
                "summary": row['summary'],
                "confidence": row['confidence'],
                "source": row['source'],
                "timestamp": row['timestamp'],
                "closed": row['closed']
            } for row in rows
        ]
        conn.close()
        return jsonify(insights)
    except Exception as e:
        logger.error(f"Error in get_closed_insights: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)