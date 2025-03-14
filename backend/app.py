import os
import logging
import threading
import sqlite3
import datetime
from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_cors import CORS
from alpaca_service import AlpacaService
from trade_executor import TradeExecutor

# Initialize Flask app
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Setup logging
logging.basicConfig(
    filename="logs/app.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize services
alpaca_service = AlpacaService()
trade_executor = TradeExecutor(alpaca_service)
db_lock = threading.Lock()

# Database setup
def init_db():
    with sqlite3.connect("trades.db") as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS trades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                action TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL,
                status TEXT NOT NULL,
                timestamp TEXT NOT NULL
            )
        """)
        conn.commit()

# API Endpoints
@app.route("/api/market_data", methods=["GET"])
def get_market_data():
    try:
        symbols = ["SPX", "QQQ", "IWM", "VIX"]
        market_data = {}
        for symbol in symbols:
            data = alpaca_service.get_symbol_data(symbol)
            market_data[symbol] = data
        return jsonify(market_data)
    except Exception as e:
        logger.error(f"Error fetching market data: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/portfolio", methods=["GET"])
def get_portfolio():
    try:
        portfolio = alpaca_service.get_portfolio()
        return jsonify(portfolio)
    except Exception as e:
        logger.error(f"Error fetching portfolio: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/trades", methods=["GET"])
def get_trades():
    try:
        conn = sqlite3.connect("trades.db")
        cursor = conn.cursor()
        cursor.execute("SELECT symbol, action, quantity, price, status, timestamp FROM trades ORDER BY timestamp DESC LIMIT 5")
        trades = [
            {
                "symbol": row[0],
                "action": row[1],
                "quantity": row[2],
                "price": row[3],
                "status": row[4],
                "timestamp": row[5]
            } for row in cursor.fetchall()
        ]
        conn.close()
        return jsonify(trades)
    except Exception as e:
        logger.error(f"Error fetching trades: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/webhook", methods=["POST"])
def webhook():
    try:
        data = request.get_json()
        if not data:
            logger.error("No JSON payload received")
            return jsonify({"error": "No JSON payload received"}), 400

        expected_key = os.getenv("WEBHOOK_KEY", "your-secret-key")
        if data.get("key") != expected_key:
            logger.error("Invalid webhook key")
            return jsonify({"error": "Invalid key"}), 403

        symbol = data.get("symbol", "")
        action = data.get("action", "").upper()
        contracts = data.get("contracts", "1")
        price = data.get("price", 0.0)

        if not symbol or not action:
            logger.error("Missing required fields: symbol or action")
            return jsonify({"error": "Missing required fields"}), 400

        parsed_alert = {
            "symbol": symbol,
            "action": action,
            "contracts": contracts,
            "price": float(price) if price else None
        }

        execution_result = trade_executor.execute_trade(parsed_alert)
        trade_data = {
            "symbol": parsed_alert.get("symbol", ""),
            "action": parsed_alert.get("action", ""),
            "quantity": int(parsed_alert.get("contracts", "1").split()[0]),
            "price": parsed_alert.get("price"),
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": execution_result["status"]
        }

        parsed_alert['execution'] = execution_result
        socketio.emit('trade_alert', parsed_alert, namespace='/')
        logger.info(f"Forwarded trade alert: {parsed_alert}")

        with db_lock:
            with app.app_context():
                conn = sqlite3.connect("trades.db")
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO trades (symbol, action, quantity, price, status, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
                    (trade_data["symbol"], trade_data["action"], trade_data["quantity"], trade_data["price"], trade_data["status"], trade_data["timestamp"])
                )
                conn.commit()
                logger.info("Stored trade in 'trades' table")
                conn.close()

        return jsonify({"status": "success", "message": "Webhook processed"}), 200

    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Initialize database
init_db()

# Start background task for fetching Discord alerts (optional, can be removed if using webhook)
def fetch_and_forward_alerts():
    while True:
        try:
            alert_message = trade_executor.fetch_discord_alerts()
            if alert_message:
                logger.info(f"Raw alert fetched: {alert_message}")
                parsed_alert = trade_executor.parse_trade_alert(alert_message)
                if parsed_alert:
                    logger.info(f"Parsed alert: {parsed_alert}")
                    trade_data = {
                        "symbol": parsed_alert.get("symbol", ""),
                        "action": parsed_alert.get("action", ""),
                        "quantity": int(parsed_alert.get("contracts", "1").split()[0]) if "contracts" in parsed_alert else 1,
                        "price": float(parsed_alert.get("price", 0.0)) if parsed_alert.get("price") else None,
                        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }
                    execution_result = trade_executor.execute_trade(parsed_alert)
                    trade_data["status"] = execution_result["status"]
                    parsed_alert["execution"] = execution_result
                    socketio.emit('trade_alert', parsed_alert, namespace='/')
                    logger.info(f"Forwarded trade alert: {parsed_alert}")

                    with db_lock:
                        conn = sqlite3.connect("trades.db")
                        cursor = conn.cursor()
                        cursor.execute(
                            "INSERT INTO trades (symbol, action, quantity, price, status, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
                            (trade_data["symbol"], trade_data["action"], trade_data["quantity"], trade_data["price"], trade_data["status"], trade_data["timestamp"])
                        )
                        conn.commit()
                        logger.info("Stored trade in 'trades' table")
                        conn.close()

            socketio.sleep(60)
        except Exception as e:
            logger.error(f"Error in fetch_and_forward_alerts: {str(e)}")
            socketio.sleep(60)

# Start background thread for Discord alerts (optional)
threading.Thread(target=fetch_and_forward_alerts, daemon=True).start()

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
