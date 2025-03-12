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
google_bp = make_google_blueprint(
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    redirect_to="google_login_callback",
    scope=["profile", "email"]
)
app.register_blueprint(google_bp, url_prefix="/auth")

# Initialize WebSocket
socketio = SocketIO(app, cors_allowed_origins="*")

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

# Database setup
def setup_database():
    conn = sqlite3.connect('trades.db')
    cursor = conn.cursor()
    
    # Create alerts table if it doesn't exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        alert TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        parsed_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create stock_data table if it doesn't exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS stock_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        price REAL,
        change_percent REAL,
        volume INTEGER,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()
    logger.info("Database initialized")

# Get database connection
def get_db_connection():
    conn = sqlite3.connect('trades.db')
    conn.row_factory = sqlite3.Row
    return conn

# Initialize database on startup
setup_database()

# Main routes
@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('auth/login.html')

@app.route('/register')
def register():
    return render_template('auth/register.html')

@app.route('/google-login')
def google_login():
    return redirect(url_for('google.login'))

@app.route('/google_login_callback')
def google_login_callback():
    if not google.authorized:
        logger.warning("Google authorization failed")
        return redirect(url_for('login'))
    
    try:
        resp = google.get('/oauth2/v1/userinfo')
        if resp.ok:
            user_info = resp.json()
            user = User(user_info['id'], user_info['name'], user_info['email'])
            session['user_data'] = {
                'id': user_info['id'],
                'name': user_info['name'],
                'email': user_info['email']
            }
            login_user(user)
            logger.info(f"User logged in: {user_info['email']}")
            return redirect(url_for('dashboard'))
        else:
            logger.error(f"Google API error: {resp.text}")
            return redirect(url_for('login'))
    except Exception as e:
        logger.error(f"Error in Google callback: {str(e)}")
        traceback.print_exc()
        return redirect(url_for('login'))

@app.route('/logout')
def logout():
    logout_user()
    session.clear()
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', user_name=current_user.name)

# Webhook endpoint to receive Discord notifications from IFTTT
@app.route('/webhook', methods=['POST'])
def discord_webhook():
    try:
        data = request.json
        logger.info(f"Received webhook data: {data}")
        
        # Extract data from IFTTT format
        alert_text = data.get("alert", "")
        timestamp = data.get("time", datetime.datetime.now().isoformat())

        if not alert_text:
            logger.error("Invalid alert data: No alert text")
            return jsonify({"error": "Invalid alert data"}), 400

        # Parse alert using GenAI
        structured_alert = parse_alert_with_ai(alert_text)
        logger.info(f"Structured alert: {structured_alert}")

        # Save to database
        conn = get_db_connection()
        conn.execute(
            "INSERT INTO alerts (alert, timestamp, parsed_data) VALUES (?, ?, ?)", 
            (alert_text, timestamp, json.dumps(structured_alert))
        )
        conn.commit()
        conn.close()

        # Add stock data if symbol is present
        if structured_alert.get("symbol"):
            try:
                stock_data = fetch_stock_data(structured_alert["symbol"])
                structured_alert["stock_data"] = stock_data
            except Exception as e:
                logger.error(f"Error fetching stock data: {str(e)}")
                structured_alert["stock_data"] = {"error": str(e)}

        # Create alert object with ID for frontend
        alert_object = {
            "id": get_last_insert_id(),
            "alert": alert_text,
            "timestamp": timestamp,
            "parsed_data": structured_alert
        }

        # Emit to frontend via WebSocket
        socketio.emit("new_alert", alert_object)
        
        return jsonify({"status": "success", "data": structured_alert})
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# Get last inserted row id
def get_last_insert_id():
    conn = get_db_connection()
    last_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    conn.close()
    return last_id

# Function to parse alert using GenAI (OpenAI API)
def parse_alert_with_ai(alert_text):
    try:
        if OPENAI_API_KEY:
            return parse_alert_with_openai(alert_text)
        elif ANTHROPIC_API_KEY:
            return parse_alert_with_claude(alert_text)
        else:
            logger.warning("No AI API keys available. Using fallback parser.")
            return fallback_alert_parser(alert_text)
    except Exception as e:
        logger.error(f"Error parsing alert with AI: {str(e)}")
        # Return a basic structure with the original text if parsing fails
        return {
            "trader": "Unknown",
            "action": "Unknown",
            "quantity": 0,
            "symbol": "Unknown",
            "strike": 0,
            "option_type": "Unknown",
            "expiration": "Unknown",
            "original_text": alert_text,
            "error": str(e)
        }

# Parse alert using OpenAI
def parse_alert_with_openai(alert_text):
    import openai
    
    openai.api_key = OPENAI_API_KEY
    
    prompt = f"""
    Extract structured trade details from this alert:
    
    '{alert_text}'
    
    Output a valid JSON object with the following format:
    {{
      "trader": "name of the trader",
      "action": "bought or sold",
      "quantity": number of contracts,
      "symbol": "stock ticker",
      "strike": strike price as a number,
      "option_type": "Call or Put",
      "expiration": "YYYY-MM-DD date format"
    }}
    
    Return ONLY the JSON object, no additional text.
    """
    
    try:
        response = openai.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You extract structured trade alert data from text, returning only valid JSON."},
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract and parse the JSON from the response
        result = response.choices[0].message.content.strip()
        # Remove any markdown code block formatting if present
        if result.startswith("```json"):
            result = result.replace("```json", "").replace("```", "").strip()
        elif result.startswith("```"):
            result = result.replace("```", "").strip()
            
        return json.loads(result)
    except Exception as e:
        logger.error(f"OpenAI parsing error: {str(e)}")
        raise

# Parse alert using Claude (Anthropic API)
def parse_alert_with_claude(alert_text):
    try:
        import anthropic
        
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        
        prompt = f"""
        Extract structured trade details from this alert:
        
        '{alert_text}'
        
        Output a valid JSON object with the following format:
        {{
          "trader": "name of the trader",
          "action": "bought or sold",
          "quantity": number of contracts,
          "symbol": "stock ticker",
          "strike": strike price as a number,
          "option_type": "Call or Put",
          "expiration": "YYYY-MM-DD date format"
        }}
        
        Return ONLY the JSON object, no additional text.
        """
        
        response = client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=300,
            system="You extract structured trade alert data from text, returning only valid JSON.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract and parse the JSON from the response
        result = response.content[0].text.strip()
        # Remove any markdown code block formatting if present
        if result.startswith("```json"):
            result = result.replace("```json", "").replace("```", "").strip()
        elif result.startswith("```"):
            result = result.replace("```", "").strip()
            
        return json.loads(result)
    except Exception as e:
        logger.error(f"Claude parsing error: {str(e)}")
        raise

# Fallback parser using regex and heuristics
def fallback_alert_parser(alert_text):
    import re
    
    # Default values
    parsed_data = {
        "trader": "Unknown",
        "action": "Unknown",
        "quantity": 0,
        "symbol": "Unknown",
        "strike": 0,
        "option_type": "Unknown",
        "expiration": ""
    }
    
    # Try to extract trader name (usually at the beginning before "bought" or "sold")
    trader_match = re.search(r"([A-Za-z0-9_]+)\s+(bought|sold)", alert_text)
    if trader_match:
        parsed_data["trader"] = trader_match.group(1)
        parsed_data["action"] = trader_match.group(2)
    
    # Extract ticker symbol (common stock tickers are 1-5 uppercase letters)
    symbol_match = re.search(r"\b([A-Z]{1,5})\b", alert_text)
    if symbol_match:
        parsed_data["symbol"] = symbol_match.group(1)
    
    # Extract quantity
    quantity_match = re.search(r"(\d+)\s+(contracts?|shares?)", alert_text)
    if quantity_match:
        parsed_data["quantity"] = int(quantity_match.group(1))
    
    # Extract option type
    if "call" in alert_text.lower():
        parsed_data["option_type"] = "Call"
    elif "put" in alert_text.lower():
        parsed_data["option_type"] = "Put"
    
    # Extract strike price
    strike_match = re.search(r"(\d+(?:\.\d+)?)[C|P]", alert_text)
    if strike_match:
        parsed_data["strike"] = float(strike_match.group(1))
    
    # Extract expiry date
    # Format might be MM/DD, MM/DD/YY, or text like "expiring 3/21"
    date_match = re.search(r"(?:expir(?:ing|es|y)|exp)?\s*(\d{1,2}/\d{1,2}(?:/\d{2,4})?)", alert_text, re.IGNORECASE)
    if date_match:
        expiry_str = date_match.group(1)
        # Add year if not present
        if expiry_str.count('/') == 1:
            current_year = datetime.datetime.now().year
            expiry_str = f"{expiry_str}/{current_year}"
        
        # Convert to YYYY-MM-DD
        try:
            # Handle both MM/DD/YY and MM/DD/YYYY formats
            if len(expiry_str.split('/')[-1]) == 2:
                date_obj = datetime.datetime.strptime(expiry_str, "%m/%d/%y")
            else:
                date_obj = datetime.datetime.strptime(expiry_str, "%m/%d/%Y")
            parsed_data["expiration"] = date_obj.strftime("%Y-%m-%d")
        except ValueError:
            # If date parsing fails, keep the original string
            parsed_data["expiration"] = expiry_str
    
    return parsed_data

# Function to fetch stock data
def fetch_stock_data(symbol):
    try:
        # Use Yahoo Finance API
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
        
        response = requests.get(url)
        data = response.json()
        
        # Extract relevant data
        result = data.get('chart', {}).get('result', [{}])[0]
        meta = result.get('meta', {})
        quote = result.get('indicators', {}).get('quote', [{}])[0]
        
        current_price = meta.get('regularMarketPrice', 0)
        previous_close = meta.get('previousClose', 0)
        volume = quote.get('volume', [0])[-1] if quote.get('volume') else 0
        
        # Calculate change percentage
        change_percent = ((current_price - previous_close) / previous_close) * 100 if previous_close else 0
        
        # Store in database
        conn = get_db_connection()
        conn.execute(
            "INSERT INTO stock_data (symbol, price, change_percent, volume) VALUES (?, ?, ?, ?)",
            (symbol, current_price, change_percent, volume)
        )
        conn.commit()
        conn.close()
        
        return {
            "symbol": symbol,
            "price": current_price,
            "change_percent": round(change_percent, 2),
            "volume": volume
        }
    
    except Exception as e:
        logger.error(f"Error fetching stock data for {symbol}: {str(e)}")
        return {"symbol": symbol, "error": str(e)}

# API route to get all alerts
@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    try:
        conn = get_db_connection()
        alerts = conn.execute('SELECT * FROM alerts ORDER BY id DESC LIMIT 50').fetchall()
        conn.close()
        
        # Convert to list of dicts
        result = []
        for alert in alerts:
            alert_dict = dict(alert)
            # Parse the stored JSON string
            try:
                alert_dict['parsed_data'] = json.loads(alert_dict['parsed_data'])
            except:
                alert_dict['parsed_data'] = {"error": "Failed to parse"}
            result.append(alert_dict)
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error fetching alerts: {str(e)}")
        return jsonify({"error": str(e)}), 500

# API route to get market indices (VIX, SPX, NDX, DJI, RUT)
@app.route('/api/indices', methods=['GET'])
def get_indices():
    try:
        # Fetch major indices
        indices = {
            "VIX": fetch_stock_data("^VIX"),
            "SPX": fetch_stock_data("^GSPC"),  # S&P 500
            "NDX": fetch_stock_data("^NDX"),   # NASDAQ-100
            "DJI": fetch_stock_data("^DJI"),   # Dow Jones Industrial Average
            "RUT": fetch_stock_data("^RUT")    # Russell 2000
        }
        
        # Emit via WebSocket too for real-time updates
        socketio.emit("indices_update", indices)
        
        return jsonify(indices)
    except Exception as e:
        logger.error(f"Error fetching indices: {str(e)}")
        return jsonify({"error": str(e)}), 500

# API route to get Alpaca portfolio details
@app.route('/api/portfolio', methods=['GET'])
@login_required
def get_portfolio():
    try:
        headers = {
            "APCA-API-KEY-ID": ALPACA_API_KEY,
            "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY
        }
        
        # Get account information
        account_response = requests.get(
            "https://paper-api.alpaca.markets/v2/account", 
            headers=headers
        )
        account_data = account_response.json()
        
        # Calculate some additional metrics
        try:
            equity = float(account_data.get('equity', 0))
            last_equity = float(account_data.get('last_equity', 0))
            if last_equity > 0:
                account_data['profit_loss_pct'] = ((equity - last_equity) / last_equity) * 100
            else:
                account_data['profit_loss_pct'] = 0
        except (ValueError, TypeError):
            account_data['profit_loss_pct'] = 0
        
        # Get positions
        positions_response = requests.get(
            "https://paper-api.alpaca.markets/v2/positions", 
            headers=headers
        )
        positions_data = positions_response.json()
        
        # Get recent orders
        orders_response = requests.get(
            "https://paper-api.alpaca.markets/v2/orders?status=all&limit=10", 
            headers=headers
        )
        orders_data = orders_response.json()
        
        portfolio_data = {
            "account": account_data,
            "positions": positions_data,
            "recent_orders": orders_data
        }
        
        # Emit via WebSocket for real-time updates
        socketio.emit("portfolio_update", portfolio_data)
        
        return jsonify(portfolio_data)
    except Exception as e:
        logger.error(f"Error fetching Alpaca data: {str(e)}")
        return jsonify({"error": str(e)}), 500

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    logger.info('Client connected')
    emit('status', {'status': 'connected'})
    
    # Send initial data
    try:
        # Recent alerts
        conn = get_db_connection()
        alerts = conn.execute('SELECT * FROM alerts ORDER BY id DESC LIMIT 20').fetchall()
        conn.close()
        
        alert_list = []
        for alert in alerts:
            try:
                parsed_data = json.loads(alert['parsed_data'])
                alert_data = {
                    "id": alert['id'],
                    "alert": alert['alert'],
                    "timestamp": alert['timestamp'],
                    "parsed_data": parsed_data
                }
                alert_list.append(alert_data)
            except:
                continue
        
        emit('initial_alerts', alert_list)
    except Exception as e:
        logger.error(f"Error sending initial data: {str(e)}")

@socketio.on('disconnect')
def handle_disconnect():
    logger.info('Client disconnected')

@socketio.on('refresh_data')
def handle_refresh():
    logger.info('Client requested data refresh')
    try:
        # Update indices
        indices = {
            "VIX": fetch_stock_data("^VIX"),
            "SPX": fetch_stock_data("^GSPC"),
            "NDX": fetch_stock_data("^NDX"),
            "DJI": fetch_stock_data("^DJI"),
            "RUT": fetch_stock_data("^RUT")
        }
        emit('indices_update', indices)
        
        # Update portfolio
        if current_user.is_authenticated:  # Only fetch portfolio data if user is logged in
            headers = {
                "APCA-API-KEY-ID": ALPACA_API_KEY,
                "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY
            }
            
            account_response = requests.get(
                "https://paper-api.alpaca.markets/v2/account", 
                headers=headers
            )
            positions_response = requests.get(
                "https://paper-api.alpaca.markets/v2/positions", 
                headers=headers
            )
            orders_response = requests.get(
                "https://paper-api.alpaca.markets/v2/orders?status=all&limit=10", 
                headers=headers
            )
            
            portfolio_data = {
                "account": account_response.json(),
                "positions": positions_response.json(),
                "recent_orders": orders_response.json()
            }
            
            emit('portfolio_update', portfolio_data)
    except Exception as e:
        logger.error(f"Error refreshing data: {str(e)}")
        emit('error', {'message': f"Error refreshing data: {str(e)}"})

# More detailed error handling for OAuth
@app.errorhandler(OAuth2Error)
def handle_oauth_error(error):
    logger.error(f"OAuth error: {str(error)}")
    return redirect(url_for('login'))

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    logger.info(f"Starting server on port {port}")
    socketio.run(app, host="0.0.0.0", port=port, debug=True)