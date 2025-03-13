from flask import Flask, redirect, url_for, session, jsonify, render_template, request
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, current_user, login_required, UserMixin
from flask_dance.contrib.google import make_google_blueprint, google
from flask_socketio import SocketIO, emit
import os
import json
import sqlite3
import datetime
import logging
import traceback
import requests
import sys
import aiohttp
import backoff
from dotenv import load_dotenv
from oauthlib.oauth2.rfc6749.errors import OAuth2Error

# Fix OAuth scope warnings
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'
os.environ['OAUTHLIB_IGNORE_SCOPE_CHANGE'] = '1'
# Allow insecure transport for development
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "TRADESYNC-BOT")

# API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
ALPACA_API_KEY = os.getenv("ALPACA_API_KEY")
ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")

# Set up Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# Google OAuth Configuration
GOOGLE_CALLBACK_URL = "https://tradesync-bot-service.onrender.com/google_login_callback"
google_bp = make_google_blueprint(
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    redirect_url=GOOGLE_CALLBACK_URL,
    scope=["profile", "email"]
)
app.register_blueprint(google_bp, url_prefix="/auth")

# Initialize WebSocket with explicit async mode for Gunicorn
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet', manage_session=False)

# User class for Flask-Login
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

def setup_database():
    os.makedirs('logs', exist_ok=True)
    conn = sqlite3.connect('trades.db')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS alerts (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        alert TEXT NOT NULL,
                        timestamp TEXT NOT NULL,
                        parsed_data TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()

setup_database()

@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    return render_template('index.html')

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', user_name=current_user.name)

@app.route('/webhook', methods=['POST'])
def discord_webhook():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data"}), 400

        alert_text = data.get("alert", "")
        timestamp = data.get("time", datetime.datetime.now().isoformat())

        if not alert_text:
            return jsonify({"error": "No alert text"}), 400

        conn = sqlite3.connect('trades.db')
        conn.execute("INSERT INTO alerts (alert, timestamp) VALUES (?, ?)", (alert_text, timestamp))
        conn.commit()
        conn.close()

        socketio.emit("new_alert", {"alert": alert_text, "timestamp": timestamp})
        return jsonify({"status": "success"})
    except Exception as e:
        logger.error(f"Webhook processing error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    try:
        conn = sqlite3.connect('trades.db')
        alerts = conn.execute('SELECT * FROM alerts ORDER BY id DESC LIMIT 50').fetchall()
        conn.close()

        result = [{"id": alert[0], "alert": alert[1], "timestamp": alert[2]} for alert in alerts]
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error fetching alerts: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat(),
        "python_version": sys.version
    })

@socketio.on('connect')
def handle_connect():
    logger.info('Client connected')
    emit('status', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info('Client disconnected')

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    logger.info(f"Starting server on port {port}")
    socketio.run(app, host="0.0.0.0", port=port, debug=True)
