from flask import Flask, request, jsonify, send_from_directory
import sqlite3
import os
import json
from datetime import datetime
from flask_cors import CORS

# Set up the Flask app
app = Flask(__name__, static_folder='frontend/build', static_url_path='')
CORS(app)

@app.route("/api")
def api_home():
    return "TradeSync Bot API", 200

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

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
    data = request.get_json()
    post_text = data.get('text', '')
    source = data.get('source', 'Unknown')
    timestamp = data.get('timestamp', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    
    insight_data = call_grok_api(post_text, source, timestamp)
    
    db_path = os.environ.get('DB_PATH', '/tmp/tradesync.db')
    conn = sqlite3.connect(db_path)
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
        timestamp TEXT
    )
    ''')
    
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
    conn.close()
    
    return 'Webhook received', 200

@app.route('/api/insights', methods=['GET'])
def get_insights():
    db_path = os.environ.get('DB_PATH', '/tmp/tradesync.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM insights ORDER BY id DESC LIMIT 10')
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
            "timestamp": row[8]
        } for row in rows
    ]
    
    return jsonify(insights)

# This catches all routes not caught by other route handlers and returns the React app
@app.route('/<path:path>')
def catch_all(path):
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
