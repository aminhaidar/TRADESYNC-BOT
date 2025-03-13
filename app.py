import os
import json
import logging
import datetime
import traceback
import sqlite3
import requests
from functools import wraps

from flask import Flask, jsonify, render_template, redirect, url_for, session, request
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, current_user, login_required, UserMixin
from flask_dance.contrib.google import make_google_blueprint, google
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv

# Fix OAuth scope warnings
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'
os.environ['OAUTHLIB_IGNORE_SCOPE_CHANGE'] = '1'
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# Load environment variables
load_dotenv()

# Logging Configuration
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "TRADESYNC-BOT")

# API Keys
ALPACA_API_KEY = os.getenv("ALPACA_API_KEY")
ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")

# Flask-Login Setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# Development-mode auth bypass decorator
def dev_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            test_user = User('test123', 'Test User', 'test@example.com')
            session['user_data'] = {'id': 'test123', 'name': 'Test User', 'email': 'test@example.com'}
            login_user(test_user)
            logger.warning("DEV MODE: Auto-logged in as test user")
        return f(*args, **kwargs)
    return decorated_function

# Google OAuth Configuration
google_bp = make_google_blueprint(
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    scope=["profile", "email"]
)
app.register_blueprint(google_bp, url_prefix="/auth")

# WebSocket Setup
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# User Model for Flask-Login
class User(UserMixin):
    def __init__(self, user_id, name, email):
        self.id = user_id
        self.name = name
        self.email = email

@login_manager.user_loader
def load_user(user_id):
    if 'user_data' not in session:
        return None
    user_data = session['user_data']
    return User(user_data['id'], user_data['name'], user_data['email'])

# Database Setup
def setup_database():
    os.makedirs('logs', exist_ok=True)
    conn = sqlite3.connect('trades.db')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS alerts (id INTEGER PRIMARY KEY AUTOINCREMENT, alert TEXT, timestamp TEXT, parsed_data TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS stock_data (id INTEGER PRIMARY KEY AUTOINCREMENT, symbol TEXT, price REAL, change_percent REAL, volume INTEGER, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()
    logger.info("Database initialized")

setup_database()

def get_db_connection():
    conn = sqlite3.connect('trades.db')
    conn.row_factory = sqlite3.Row
    return conn

# Fetch stock data from Alpaca API
def fetch_stock_data(symbol):
    if not ALPACA_API_KEY or not ALPACA_SECRET_KEY:
        logger.warning("Alpaca API keys not configured")
        return {"symbol": symbol, "error": "Alpaca API not configured"}

    headers = {
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY
    }

    try:
        url = f"https://data.alpaca.markets/v2/stocks/{symbol}/quotes/latest"
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        stock_price = data.get('quote', {}).get('ap', 0)
        return {"symbol": symbol, "price": stock_price}
    except Exception as e:
        logger.error(f"Error fetching stock data for {symbol}: {str(e)}")
        return {"symbol": symbol, "error": str(e)}

@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('auth/login.html')

@app.route('/logout')
def logout():
    logout_user()
    session.clear()
    return redirect(url_for('index'))

@app.route('/dashboard')
@dev_login_required
def dashboard():
    return render_template('dashboard.html', user_name=current_user.name)

@app.route('/api/market_data', methods=['GET'])
def get_market_data():
    try:
        indices = {
            "VIX": fetch_stock_data("^VIX"),
            "SPX": fetch_stock_data("^GSPC"),
            "NDX": fetch_stock_data("^NDX"),
            "DJI": fetch_stock_data("^DJI")
        }
        return jsonify(indices)
    except Exception as e:
        logger.error(f"Error fetching market data: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/portfolio', methods=['GET'])
@dev_login_required
def get_portfolio():
    try:
        portfolio_data = get_alpaca_data()
        return jsonify(portfolio_data)
    except Exception as e:
        logger.error(f"Error fetching portfolio: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.datetime.now().isoformat()})

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    logger.info(f"Starting server on port {port}")
    socketio.run(app, host="0.0.0.0", port=port, debug=True)
