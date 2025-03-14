import os
import logging
import datetime
import threading
import time
import sqlite3
from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv
from trade_routes import trade_routes
from fetch_samples import fetch_discord_alerts, parse_trade_alert
from alpaca_service import fetch_stock_data, get_alpaca_portfolio
from trade_executor import execute_trade
from database import get_db_connection

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("logs/app.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Ensure DATABASE_URI is correctly configured
app.config['DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///trades.db')
logger.info(f"Using DATABASE_URI: {app.config['DATABASE_URI']}")

# Initialize WebSocket
socketio = SocketIO(app, cors_allowed_origins="*")

# Register API routes
app.register_blueprint(trade_routes, url_prefix="/api")

# Setup database within application context
with app.app_context():
    def setup_database():
        try:
            logger.info("Setting up the database...")
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS trades (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    symbol TEXT NOT NULL,
                    action TEXT NOT NULL,
                    quantity INTEGER NOT NULL,
                    timestamp TEXT NOT NULL
                )
            """)
            conn.commit()
            logger.info("Database setup completed successfully: trades table created or verified")
        except Exception as e:
            logger.error(f"Error setting up database: {str(e)}")
            raise  # Fail early if setup fails
        finally:
            if 'conn' in locals():
                conn.close()

    setup_database()


# API ENDPOINTS
@app.route("/api/market_data", methods=["GET"])
def get_market_data():
    try:
        indices = {
            "SPY": fetch_stock_data("SPY"),
            "QQQ": fetch_stock_data("QQQ"),
            "DIA": fetch_stock_data("DIA"),
            "IWM": fetch_stock_data("IWM"),
            "VIX": fetch_stock_data("VIX"),
        }
        socketio.emit("indices_update", indices)
        return jsonify(indices)
    except Exception as e:
        logger.error(f"Error fetching market data: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/portfolio", methods=["GET"])
def get_portfolio():
    try:
        portfolio_data = get_alpaca_portfolio()
        socketio.emit("portfolio_update", portfolio_data)
        return jsonify(portfolio_data)
    except Exception as e:
        logger.error(f"Error fetching portfolio: {str(e)}")
        return jsonify({"error": str(e)}), 500


# WEBSOCKETS
@socketio.on("connect")
def handle_connect():
    logger.info("Client connected")
    emit("status", {"status": "connected"})


@socketio.on("disconnect")
def handle_disconnect():
    logger.info("Client disconnected")


@socketio.on("refresh_data")
def handle_refresh():
    logger.info("Client requested data refresh")
    try:
        indices = {
            "SPY": fetch_stock_data("SPY"),
            "QQQ": fetch_stock_data("QQQ"),
            "DIA": fetch_stock_data("DIA"),
            "IWM": fetch_stock_data("IWM"),
            "VIX": fetch_stock_data("VIX"),
        }
        emit("indices_update", indices)
    except Exception as e:
        logger.error(f"Error refreshing data: {str(e)}")
        emit("error", {"message": f"Error refreshing data: {str(e)}"})


# TRADE ALERT FETCHING AND FORWARDING
def fetch_and_forward_alerts():
    while True:
        logger.info("Starting fetch_and_forward_alerts loop")
        try:
            logger.info("Attempting to fetch Discord alerts")
            alert_message = fetch_discord_alerts()
            if alert_message:
                logger.info(f"Raw alert fetched: {alert_message}")
                parsed_alert = parse_trade_alert(alert_message)
                if parsed_alert:
                    logger.info(f"Parsed alert: {parsed_alert}")
                    trade_data = {
                        "symbol": parsed_alert.get("symbol", ""),
                        "action": parsed_alert.get("action", ""),
                        "quantity": int(parsed_alert.get("contracts", "1").split()[0]) if "contracts" in parsed_alert else 1,
                        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }
                    execution_result = execute_trade(parsed_alert)
                    parsed_alert['execution'] = execution_result
                    socketio.emit('trade_alert', parsed_alert, namespace='/')
                    logger.info(f"Forwarded trade alert: {parsed_alert}")

                    with app.app_context():
                        conn = get_db_connection()
                        cursor = conn.cursor()
                        cursor.execute(
                            "INSERT INTO trades (symbol, action, quantity, timestamp) VALUES (?, ?, ?, ?)",
                            (trade_data["symbol"], trade_data["action"], trade_data["quantity"], trade_data["timestamp"])
                        )
                        conn.commit()
                        logger.info("Stored trade in 'trades' table")
                        conn.close()
                else:
                    logger.warning("Failed to parse alert")
            else:
                logger.warning("No alert fetched from Discord")
        except Exception as e:
            logger.error(f"Error in fetch_and_forward_alerts: {str(e)}")
        logger.info("Sleeping for 10 seconds")
        time.sleep(10)


# HEALTH CHECK
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat(),
    })


if __name__ == "__main__":
    threading.Thread(target=fetch_and_forward_alerts, daemon=True).start()
    port = int(os.getenv("PORT", 5000))
    logger.info(f"Starting server on port {port}")
    socketio.run(app, host="0.0.0.0", port=port)
