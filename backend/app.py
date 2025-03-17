from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os
import logging
from datetime import datetime
import json

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'tradesync-secret-key'
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Mock data for development
mock_trades = [
    {
        "id": 1,
        "symbol": "AAPL",
        "action": "buy",
        "quantity": 1.0,
        "price": 180.0,
        "current_price": 185.75,
        "status": "executed",
        "timestamp": "2025-03-16 12:00:00",
        "confidence": 0.85,
        "source": "AI Insight",
        "option_details": "155C 04/17"
    }
]

mock_insights = [
    {"symbol": "AAPL", "recommendation": "Buy", "summary": "Strong upward trend with 85% confidence", "confidence": 0.85, "category": "technical"},
    {"symbol": "MSFT", "recommendation": "Buy", "summary": "Positive earnings forecast with 90% confidence", "confidence": 0.90, "category": "fundamental"},
    {"symbol": "TSLA", "recommendation": "Sell", "summary": "Overbought conditions with 75% confidence", "confidence": 0.75, "category": "technical"},
    {"symbol": "AMZN", "recommendation": "Hold", "summary": "Market uncertainty with 65% confidence", "confidence": 0.65, "category": "news"},
    {"symbol": "GOOGL", "recommendation": "Buy", "summary": "Breakout pattern with 80% confidence", "confidence": 0.80, "category": "technical"}
]

chart_data = {
    "labels": ["2025-03-09", "2025-03-10", "2025-03-11", "2025-03-12", "2025-03-13", "2025-03-14", "2025-03-15"],
    "datasets": [
        {"label": "TradeSync Portfolio", "data": [10562.58, 10634.92, 10689.87, 10742.42, 10798.81, 10845.23, 10921.45], "borderColor": "#3fb950", "backgroundColor": "rgba(63, 185, 80, 0.2)", "tension": 0.4, "fill": True},
        {"label": "SPY Benchmark", "data": [10532.55, 10578.12, 10615.93, 10650.85, 10695.67, 10728.33, 10785.12], "borderColor": "#8b949e", "backgroundColor": "rgba(139, 148, 158, 0.2)", "tension": 0.4, "fill": True}
    ]
}

metrics = {
    "accountValue": 10921.45,
    "availableCash": 5243.67,
    "totalPnl": 375.82,
    "openPositions": 3,
    "winRate": 72.5
}

positions = [
    {"symbol": "AAPL", "quantity": 1, "avgPrice": 180.00, "currentPrice": 185.75, "pnl": 5.75},
    {"symbol": "MSFT", "quantity": 2, "avgPrice": 410.25, "currentPrice": 412.50, "pnl": 4.50},
    {"symbol": "AMZN", "quantity": 1, "avgPrice": 178.50, "currentPrice": 176.80, "pnl": -1.70}
]

@app.route('/api/dashboard-data', methods=['GET'])
def get_dashboard_data():
    try:
        response_data = {
            "trades": mock_trades,
            "insights": mock_insights,
            "chartData": chart_data,
            "metrics": metrics,
            "positions": positions
        }
        logger.info(f"Returning dashboard data")
        return jsonify(response_data)
    except Exception as e:
        logger.error(f"Error in get_dashboard_data: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/trigger-trade', methods=['POST'])
def trigger_trade():
    try:
        trade = {
            "symbol": "AAPL",
            "action": "buy",
            "quantity": 1,
            "price": 185.75,
            "option_details": "155C 04/17",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "source": "Manual Trigger",
            "status": "pending",
            "confidence": 0.85
        }
        socketio.emit('live_trade_update', trade)
        logger.info(f"Manually triggered trade update: {trade}")
        return jsonify({"message": "Trade update triggered", "trade": trade})
    except Exception as e:
        logger.error(f"Error in trigger_trade: {str(e)}")
        return jsonify({"error": str(e)}), 500

@socketio.on('connect')
def handle_connect():
    logger.info(f"Client connected, socket ID: {request.sid}")
    emit('connection_response', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info(f"Client disconnected, socket ID: {request.sid}")

@socketio.on('execute_trade')
def handle_execute_trade(data):
    logger.info(f"Received execute_trade event: {data}")
    try:
        # Create a new trade object based on the received data
        trade = {
            "id": len(mock_trades) + 1,
            "symbol": data.get("symbol", "AAPL"),
            "action": data.get("action", "buy"),
            "quantity": data.get("quantity", 1),
            "price": data.get("price", 185.75),
            "current_price": data.get("price", 185.75),
            "option_details": "155C 04/17",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": "executed",
            "confidence": data.get("confidence", 0.85),
            "source": data.get("source", "TradeSync Bot")
        }
        
        # Add to mock database
        mock_trades.append(trade)
        
        # Emit the trade update to all connected clients
        socketio.emit('live_trade_update', trade)
        logger.info(f"Trade executed and broadcast: {trade}")
        
        return {"success": True, "trade": trade}
    except Exception as e:
        logger.error(f"Error executing trade: {str(e)}")
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    logger.info(f"Starting server on port {port}")
    socketio.run(app, host="0.0.0.0", port=port, debug=True)
