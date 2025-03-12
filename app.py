from flask import Flask, request, render_template, jsonify
import os
import json
from datetime import datetime

from config import Config
from services.discord.discord_service import discord_service
from models.trade import Trade
from utils.logger import app_logger as logger

app = Flask(__name__)
app.config.from_object(Config)

@app.route('/')
def home():
    """Render the main dashboard page"""
    return render_template('index.html')

@app.route('/webhook', methods=['POST'])
def webhook():
    """Endpoint for receiving Discord webhook messages"""
    try:
        data = request.json
        if not data:
            logger.warning("Received empty webhook request")
            return jsonify({"status": "error", "message": "No data provided"}), 400
        
        # Process the Discord message
        result = discord_service.process_message(data)
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/discord_trades', methods=['GET'])
def get_discord_trades():
    """API endpoint for getting Discord trades"""
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
        logger.error(f"Error getting discord trades: {str(e)}")
        return jsonify([]), 500

@app.route('/api/trades', methods=['GET'])
def get_trades():
    """API endpoint for getting all trades"""
    try:
        db_trades = Trade.get_all(limit=50)
        trades_json = []
        
        for trade in db_trades:
            trades_json.append({
                "id": trade.id,
                "symbol": trade.symbol,
                "price": trade.price,
                "quantity": trade.quantity,
                "type": trade.trade_type,
                "time": trade.timestamp,
                "source": trade.source
            })
        
        return jsonify(trades_json)
    except Exception as e:
        logger.error(f"Error getting trades: {str(e)}")
        return jsonify([]), 500

if __name__ == '__main__':
    app.run(debug=Config.DEBUG)
