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
import logging.handlers
import traceback
import sys
import secrets
from dotenv import load_dotenv
from oauthlib.oauth2.rfc6749.errors import OAuth2Error
from functools import wraps
import ssl

# Load environment variables
load_dotenv()

# Create logs directory
os.makedirs('logs', exist_ok=True)

# Configure logging with rotating file handler
log_handler = logging.handlers.RotatingFileHandler(
    'logs/app.log',
    maxBytes=10485760,  # 10MB
    backupCount=5
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        log_handler,
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": os.getenv("ALLOWED_ORIGINS", "*").split(",")}})

# Secret key - generate a secure key for production
if os.getenv("FLASK_ENV") == "production":
    # In production, require the secret key to be set
    if not os.getenv("FLASK_SECRET_KEY"):
        logger.critical("FLASK_SECRET_KEY is not set in production environment!")
        sys.exit(1)
    app.secret_key = os.getenv("FLASK_SECRET_KEY")
else:
    # In development, we can use a default or generate one
    app.secret_key = os.getenv("FLASK_SECRET_KEY", secrets.token_hex(32))
    # Only relax OAuth security constraints in development
    os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'
    os.environ['OAUTHLIB_IGNORE_SCOPE_CHANGE'] = '1'
    # This should NEVER be set in production
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# API Keys - validate they exist in production
if os.getenv("FLASK_ENV") == "production":
    required_keys = ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "ALPACA_API_KEY", "ALPACA_SECRET_KEY"]
    missing_keys = [key for key in required_keys if not os.getenv(key)]
    if missing_keys:
        logger.critical(f"Missing required API keys in production: {', '.join(missing_keys)}")
        sys.exit(1)

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
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
    logger.warning("Google OAuth credentials not set properly!")
    if os.getenv("FLASK_ENV") == "production":
        logger.critical("OAuth credentials must be set in production!")
        sys.exit(1)

google_bp = make_google_blueprint(
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    scope=["profile", "email"]
)
app.register_blueprint(google_bp, url_prefix="/auth")

# Initialize WebSocket with appropriate CORS settings
socketio_cors_origins = os.getenv("SOCKET_ALLOWED_ORIGINS", "*")
if os.getenv("FLASK_ENV") == "production" and socketio_cors_origins == "*":
    logger.warning("SocketIO CORS is set to allow all origins (*) in production!")

# Import eventlet and monkey patch if using eventlet
try:
    import eventlet
    eventlet.monkey_patch()
    socketio = SocketIO(
        app, 
        cors_allowed_origins=socketio_cors_origins.split(","), 
        async_mode='eventlet', 
        manage_session=False
    )
    logger.info("Using eventlet for SocketIO")
except ImportError:
    logger.warning("Eventlet not found, falling back to default async mode")
    socketio = SocketIO(
        app, 
        cors_allowed_origins=socketio_cors_origins.split(","), 
        manage_session=False
    )

# Webhook verification token
WEBHOOK_TOKEN = os.getenv("WEBHOOK_TOKEN")
if os.getenv("FLASK_ENV") == "production" and not WEBHOOK_TOKEN:
    logger.warning("WEBHOOK_TOKEN is not set in production! This may expose your webhook to abuse.")

# Decorator for webhook authentication
def require_webhook_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Skip token verification if not in production or no token is set
        if os.getenv("FLASK_ENV") != "production" or not WEBHOOK_TOKEN:
            return f(*args, **kwargs)
        
        # Check for token in the Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.warning("Webhook called without valid Authorization header")
            return jsonify({"error": "Unauthorized"}), 401
        
        token = auth_header.split(' ')[1]
        if token != WEBHOOK_TOKEN:
            logger.warning("Webhook called with invalid token")
            return jsonify({"error": "Unauthorized"}), 401
            
        return f(*args, **kwargs)
    return decorated_function

# User class for Flask-Login
class User(UserMixin):
    def __init__(self, user_id, name, email):
        self.id = user_id
        self.name = name
        self.email = email

@login_manager.user_loader
def load_user(user_id):
    try:
        # Get user from database
        conn = sqlite3.connect('trades.db')
        cursor = conn.cursor()
        user_data = cursor.execute("SELECT id, name, email FROM users WHERE id = ?", (user_id,)).fetchone()
        conn.close()
        
        if user_data:
            return User(user_data[0], user_data[1], user_data[2])
        return None
    except Exception as e:
        logger.error(f"Error loading user: {str(e)}")
        logger.error(traceback.format_exc())
        return None

def setup_database():
    try:
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
        logger.info("Database setup completed successfully")
    except Exception as e:
        logger.critical(f"Failed to set up database: {str(e)}")
        logger.critical(traceback.format_exc())
        sys.exit(1)  # Exit if database setup fails

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
        cursor.execute(
            "INSERT OR REPLACE INTO users (id, name, email, created_at) VALUES (?, ?, ?, datetime('now'))",
            (user_id, user_name, user_email)
        )
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
@require_webhook_token
def discord_webhook():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data"}), 400

        alert_text = data.get("alert", "")
        
        # Validate timestamp format
        timestamp_raw = data.get("time")
        if timestamp_raw:
            try:
                # Attempt to parse the timestamp to ensure valid format
                datetime.datetime.fromisoformat(timestamp_raw)
                timestamp = timestamp_raw
            except (ValueError, TypeError):
                # If parsing fails, use current time
                logger.warning(f"Invalid timestamp format received: {timestamp_raw}")
                timestamp = datetime.datetime.now().isoformat()
        else:
            timestamp = datetime.datetime.now().isoformat()

        if not alert_text:
            return jsonify({"error": "No alert text"}), 400

        conn = sqlite3.connect('trades.db')
        conn.execute(
            "INSERT INTO alerts (alert, timestamp, created_at) VALUES (?, ?, datetime('now'))", 
            (alert_text, timestamp)
        )
        conn.commit()
        conn.close()

        # Emit the alert to all connected clients
        socketio.emit("new_alert", {"alert": alert_text, "timestamp": timestamp})
        logger.info(f"New alert received and broadcasted: {alert_text[:50]}...")
        return jsonify({"status": "success"})
    except Exception as e:
        logger.error(f"Webhook processing error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/alerts', methods=['GET'])
@login_required
def get_alerts():
    try:
        # Get and validate pagination parameters
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        # Validate parameters
        if not isinstance(limit, int) or limit <= 0:
            limit = 50  # Default fallback
        if limit > 1000:  # Set a reasonable upper bound
            limit = 1000
            
        if not isinstance(offset, int) or offset < 0:
            offset = 0

        conn = sqlite3.connect('trades.db')
        # Use both LIMIT and OFFSET for pagination
        alerts = conn.execute(
            'SELECT id, alert, timestamp, parsed_data, created_at FROM alerts ORDER BY id DESC LIMIT ? OFFSET ?', 
            (limit, offset)
        ).fetchall()
        
        # Get total count for pagination info
        total_count = conn.execute('SELECT COUNT(*) FROM alerts').fetchone()[0]
        conn.close()

        # Structure the results with field names for clarity
        result = [
            {
                "id": alert[0], 
                "alert": alert[1], 
                "timestamp": alert[2],
                "parsed_data": alert[3],
                "created_at": alert[4]
            } 
            for alert in alerts
        ]
        
        # Return with pagination metadata
        return jsonify({
            "alerts": result,
            "pagination": {
                "total": total_count,
                "limit": limit,
                "offset": offset,
                "has_more": (offset + limit) < total_count
            }
        })
    except Exception as e:
        logger.error(f"Error fetching alerts: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    try:
        # Check database connection
        conn = sqlite3.connect('trades.db')
        conn.execute('SELECT 1').fetchone()
        conn.close()
        db_status = "connected"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        db_status = "disconnected"

    # Check OAuth configuration
    oauth_status = "configured" if google.authorized else "not_configured"
    
    return jsonify({
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "oauth": oauth_status,
        "timestamp": datetime.datetime.now().isoformat(),
        "environment": os.getenv("FLASK_ENV", "development"),
        "python_version": sys.version
    })

@socketio.on('connect')
def handle_connect():
    logger.info(f'Client connected: {request.sid}')
    emit('status', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info(f'Client disconnected: {request.sid}')

# Production server configuration
if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    logger.info(f"Starting server on port {port} in {os.getenv('FLASK_ENV', 'development')} mode")
    
    # Configure SSL in production
    if os.getenv("FLASK_ENV") == "production" and os.getenv("SSL_CERT") and os.getenv("SSL_KEY"):
        ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
        ssl_context.load_cert_chain(os.getenv("SSL_CERT"), os.getenv("SSL_KEY"))
        socketio.run(
            app, 
            host="0.0.0.0", 
            port=port, 
            ssl_context=ssl_context,
            debug=False
        )
    else:
        debug_mode = os.getenv("FLASK_ENV") != "production"
        socketio.run(
            app, 
            host="0.0.0.0", 
            port=port, 
            debug=debug_mode
        )