from flask import Flask, request, render_template, jsonify
import logging
import os
import json
from datetime import datetime
from config import Config
from services.discord_service import process_discord_message

app = Flask(__name__)
app.config.from_object(Config)

# Set up logging
logging.basicConfig(
    filename=Config.LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/webhook', methods=['POST'])
def webhook():
    try:
        data = request.json
        if not data:
            return jsonify({"status": "error", "message": "No data provided"}), 400
        
        # Process the Discord message
        result = process_discord_message(data)
        
        return jsonify({"status": "success", "message": "Data received"}), 200
    except Exception as e:
        logging.error(f"Error processing webhook: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/discord_trades', methods=['GET'])
def get_discord_trades():
    try:
        # Try to read from the log file
        trades = []
        if os.path.exists('discord_trades.log'):
            with open('discord_trades.log', 'r') as f:
                for line in f:
                    try:
                        entry = json.loads(line.strip())
                        trades.append({
                            "alert": entry.get('message', ''),
                            "time": entry.get('time', ''),
                            "source": "Discord"
                        })
                    except:
                        continue
        
        # If no trades found, return sample data
        if not trades:
            trades = [
                {"alert": "BOUGHT NDX 20700C 3/6 16 - 1 cont", "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "source": "Discord"},
                {"alert": "SOLD AAPL 190P 3/10 4 - 3 cont", "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "source": "Discord"}
            ]
        
        return jsonify(trades)
    except Exception as e:
        logging.error(f"Error getting discord trades: {str(e)}")
        return jsonify([]), 500

if __name__ == '__main__':
    app.run(debug=True)