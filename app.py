import os
import json
import logging
import datetime
import traceback
import requests
import sqlite3
from flask import Flask, redirect, url_for, session, jsonify, render_template, request
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, current_user, login_required, UserMixin
from flask_socketio import SocketIO, emit
from flask_dance.contrib.google import make_google_blueprint, google
from dotenv import load_dotenv
from routes.stock_routes import stock_routes
from routes.trade_routes import trade_routes
from services.alpaca_service import fetch_stock_data
from websocket import socketio
from database import setup_database

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
CORS(app)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "TRADESYNC-BOT")

# Setup database
setup_database()

# Flask-Login Setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# Register API routes as blueprints
app.register_blueprint(stock_routes)
app.register_blueprint(trade_routes)

# Initialize WebSocket
socketio.init_app(app, cors_allowed_origins="*")


### AUTHENTICATION SETUP ###

google_bp = make_google_blueprint(
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    scope=["profile", "email"],
)
app.register_blueprint(google_bp, url_prefix="/auth")


class User(UserMixin):
    def __init__(self, user_id, name, email):
        self.id = user_id
        self.name = name
        self.email = email


@login_manager.user_loader
def load_user(user_id):
    if "user_data" not in session:
        return None
    user_data = session["user_data"]
    return User(user_data["id"], user_data["name"], user_data["email"])


@app.route("/")
def index():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    return render_template("index.html")


@app.route("/dashboard")
@login_required
def dashboard():
    return render_template("dashboard.html", user_name=current_user.name)


@app.route("/auth/google/authorized")
def google_authorized():
    logger.info("Received Google login callback")
    if not google.authorized:
        return redirect(url_for("login"))

    try:
        resp = google.get("/oauth2/v1/userinfo")
        if resp.ok:
            user_info = resp.json()
            user = User(user_info["id"], user_info["name"], user_info["email"])
            session["user_data"] = {
                "id": user_info["id"],
                "name": user_info["name"],
                "email": user_info["email"],
            }
            login_user(user)
            return redirect(url_for("dashboard"))
        else:
            return redirect(url_for("login"))
    except Exception as e:
        logger.error(f"Google login error: {str(e)}")
        traceback.print_exc()
        return redirect(url_for("login"))


@app.route("/logout")
def logout():
    logout_user()
    session.clear()
    return redirect(url_for("index"))


### API ENDPOINTS ###

@app.route("/api/stock_data", methods=["GET"])
def get_stock_data():
    """
    Fetch stock data from Alpaca API for real-time updates.
    """
    try:
        symbol = request.args.get("symbol", "AAPL")  # Default to AAPL
        stock_data = fetch_stock_data(symbol)
        return jsonify(stock_data)
    except Exception as e:
        logger.error(f"Error fetching stock data: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/market_data", methods=["GET"])
def get_market_data():
    """
    Fetch stock indices data using Alpaca API.
    """
    try:
        indices = {
            "SPY": fetch_stock_data("SPY"),
            "QQQ": fetch_stock_data("QQQ"),
            "DIA": fetch_stock_data("DIA"),
            "IWM": fetch_stock_data("IWM"),
            "VIX": fetch_stock_data("VIX"),
        }

        socketio.emit("indices_update", indices)  # Push data to WebSocket clients
        return jsonify(indices)
    except Exception as e:
        logger.error(f"Error fetching market data: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/portfolio", methods=["GET"])
@login_required
def get_portfolio():
    """
    Fetch user's Alpaca portfolio data.
    """
    from services.alpaca_service import get_alpaca_portfolio

    try:
        portfolio_data = get_alpaca_portfolio()
        socketio.emit("portfolio_update", portfolio_data)
        return jsonify(portfolio_data)
    except Exception as e:
        logger.error(f"Error fetching portfolio: {str(e)}")
        return jsonify({"error": str(e)}), 500


### WEBSOCKETS ###

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


### HEALTH CHECK ###

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify(
        {
            "status": "healthy",
            "timestamp": datetime.datetime.now().isoformat(),
        }
    )


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    logger.info(f"Starting server on port {port}")
    socketio.run(app, host="0.0.0.0", port=port, debug=True)
