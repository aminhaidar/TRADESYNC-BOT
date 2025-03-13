import os
import json
import logging
import traceback
import requests
import datetime
import sqlite3

from flask import Flask, jsonify, render_template, redirect, url_for, request, session
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, current_user, login_required, UserMixin
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv
import alpaca_trade_api as tradeapi

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("logs/app.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "TRADESYNC-BOT")

# Initialize WebSocket
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

# Set up Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# Alpaca API Configuration
ALPACA_API_KEY = os.getenv("ALPACA_API_KEY")
ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")
ALPACA_BASE_URL = "https://paper-api.alpaca.markets"

api = tradeapi.REST(ALPACA_API_KEY, ALPACA_SECRET_KEY, base_url=ALPACA_BASE_URL)


### DATABASE SETUP ###
def setup_database():
    try:
        os.makedirs("logs", exist_ok=True)
        conn = sqlite3.connect("trades.db")
        cursor = conn.cursor()
        cursor.execute(
            """CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                alert TEXT NOT NULL, 
                timestamp TEXT NOT NULL, 
                parsed_data TEXT, 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"""
        )
        cursor.execute(
            """CREATE TABLE IF NOT EXISTS stock_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                symbol TEXT NOT NULL, 
                price REAL, 
                change_percent REAL, 
                volume INTEGER, 
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"""
        )
        conn.commit()
        conn.close()
        logger.info("Database initialized")
    except Exception as e:
        logger.error(f"Database initialization error: {str(e)}")
        traceback.print_exc()


setup_database()


### ROUTES ###
@app.route("/")
def index():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    return render_template("index.html")


@app.route("/api/portfolio", methods=["GET"])
@login_required
def get_portfolio():
    try:
        account = api.get_account()
        positions = api.list_positions()
        portfolio = {
            "equity": account.equity,
            "cash": account.cash,
            "positions": [
                {"symbol": p.symbol, "qty": p.qty, "market_value": p.market_value}
                for p in positions
            ],
        }
        return jsonify(portfolio)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/market_indices", methods=["GET"])
def get_market_indices():
    try:
        symbols = ["VIX", "SPY", "IWM", "BTCUSD"]
        quotes = {symbol: api.get_last_trade(symbol)._raw for symbol in symbols}
        return jsonify(quotes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/trades", methods=["GET"])
@login_required
def get_trades():
    try:
        orders = api.list_orders(status="all", limit=10)
        trade_data = [
            {
                "symbol": o.symbol,
                "qty": o.qty,
                "side": o.side,
                "status": o.status,
                "created_at": o.created_at,
            }
            for o in orders
        ]
        return jsonify(trade_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# WebSocket for real-time updates
@socketio.on("refresh_data")
def refresh_data():
    logger.info("Client requested data refresh")
    try:
        indices = get_market_indices()
        emit("indices_update", indices)

        if current_user.is_authenticated:
            portfolio_data = get_portfolio()
            emit("portfolio_update", portfolio_data)
    except Exception as e:
        logger.error(f"Error refreshing data: {str(e)}")
        emit("error", {"message": f"Error refreshing data: {str(e)}"})


@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Resource not found"}), 404


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    logger.info(f"Starting server on port {port}")
    socketio.run(app, host="0.0.0.0", port=port, debug=True)
