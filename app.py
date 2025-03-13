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
import sys
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
login_manager.login_view = "login"  # Changed from "index" to "login"

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
    logger.warning("Google OAuth credentials not set properly!")

google_bp = make_google_blueprint(
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    scope=["profile", "email"]
)
app.register_blueprint(google_bp, url_prefix="/auth")

# Initialize WebSocket with explicit async mode for Gunicorn
# Import eventlet and monkey patch if using eventlet
try:
    import eventlet
    eventlet.monkey_patch()
    socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet', manage_session=False)
    logger.info("Using eventlet for SocketIO")
except ImportError:
    logger.warning("Eventlet not found, falling back to default async mode")
    socketio = SocketIO(app, cors_allowed_origins="*", manage_session=False)

# User class for Flask-Login
class User(UserMixin):
    def __init__(self, user_id, name, email):
        self.id = user_id
        self.name = name
        self.email = email

@login_manager.user_loader
def load_user(user_id):
    # Get user from database instead of session
    conn = sqlite3.connect('trades.db')
    cursor = conn.cursor()
    user_data = cursor.execute("SELECT id, name, email FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    
    if user_data:
        return User(user_data[0], user_data[1], user_data[2])
    return None

def setup_database():
    os.makedirs('logs', exist_ok=True)
    conn = sqlite3.connect('trades.db')
    cursor = conn.cursor()
    
    # Create alerts table
    cursor.execute('''CREATE TABLE IF NOT EXISTS alerts (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        alert TEXT NOT NULL,
                        timestamp TEXT NOT NULL,
                        parsed_data TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    # Create users table
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        email TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    conn.commit()
    conn.close()

setup_database()

@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    return render_template('index.html')

@app.route('/login')
def login():
    return redirect(url_for('google.login'))

@app.route('/google_login_callback')
def google_login_callback():
    if not google.authorized:
        return redirect(url_for('google.login'))
    
    try:
        resp = google.get('/oauth2/v2/userinfo')
        assert resp.ok, resp.text
        user_info = resp.json()
        
        user_id = user_info['id']
        user_name = user_info.get('name', 'User')
        user_email = user_info.get('email', '')
        
        # Save user to database
        conn = sqlite3.connect('trades.db')
        cursor = conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO users (id, name, email, created_at) VALUES (?, ?, ?, datetime('now'))",
                    (user_id, user_name, user_email))
        conn.commit()
        conn.close()
        
        # Log in the user
        user = User(user_id, user_name, user_email)
        login_user(user)
        
        logger.info(f"User logged in: {user_email}")
        return redirect(url_for('dashboard'))
    
    except Exception as e:
        logger.error(f"Google login error: {str(e)}")
        logger.error(traceback.format_exc())
        return redirect(url_for('index'))

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

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
        # Added explicit created_at timestamp for better SQLite compatibility
        conn.execute("INSERT INTO alerts (alert, timestamp, created_at) VALUES (?, ?, datetime('now'))", 
                    (alert_text, timestamp))
        conn.commit()
        conn.close()

        # Emit the alert to all connected clients
        socketio.emit("new_alert", {"alert": alert_text, "timestamp": timestamp})
        return jsonify({"status": "success"})
    except Exception as e:
        logger.error(f"Webhook processing error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/alerts', methods=['GET'])
@login_required
def get_alerts():
    try:
        limit = request.args.get('limit', 50, type=int)
        # Added validation for limit parameter
        if not isinstance(limit, int) or limit <= 0:
            limit = 50  # Default fallback
            
        conn = sqlite3.connect('trades.db')
        alerts = conn.execute('SELECT * FROM alerts ORDER BY id DESC LIMIT ?', (limit,)).fetchall()
        conn.close()

        result = [{"id": alert[0], "alert": alert[1], "timestamp": alert[2]} for alert in alerts]
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error fetching alerts: {str(e)}")
        logger.error(traceback.format_exc())
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
    socketio.run(app, host="0.0.0.0", port=port, debug=os.getenv("FLASK_ENV") == "development")