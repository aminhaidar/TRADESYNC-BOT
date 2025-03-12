from flask import Flask, request, render_template, jsonify, redirect, url_for, flash, session
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_wtf.csrf import CSRFProtect
from flask_dance.contrib.google import make_google_blueprint, google
import os
import json
from datetime import datetime

from config import Config
from services.discord.discord_service import discord_service
from models.trade import Trade
from models.user import User
from utils.logger import app_logger as logger

app = Flask(__name__)
app.config.from_object(Config)
csrf = CSRFProtect(app)

# Setup login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Setup Google OAuth
google_bp = make_google_blueprint(
    client_id=Config.GOOGLE_CLIENT_ID,
    client_secret=Config.GOOGLE_CLIENT_SECRET,
    scope=["profile", "email"],
    redirect_to="google_callback"
)
app.register_blueprint(google_bp, url_prefix="/login")

@login_manager.user_loader
def load_user(user_id):
    return User.get_by_id(int(user_id))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    
    error = None
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.get_by_username(username)
        
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('home'))
        else:
            error = 'Invalid username or password'
    
    return render_template('auth/login.html', error=error)

@app.route("/login/google")
def google_login():
    if not google.authorized:
        return redirect(url_for("google.login"))
    return redirect(url_for("google_callback"))

@app.route("/google-callback")
def google_callback():
    if not google.authorized:
        flash("Failed to log in with Google.", "error")
        return redirect(url_for("login"))
    
    resp = google.get("/oauth2/v1/userinfo")
    if resp.ok:
        google_info = resp.json()
        google_id = google_info["id"]
        
        # Check if user exists
        user = User.get_by_google_id(google_id)
        
        if not user:
            # Create new user
            email = google_info.get("email")
            name = google_info.get("name", email.split("@")[0])
            
            # Check if email already exists
            existing_user = User.get_by_email(email)
            if existing_user:
                # Link Google ID to existing account
                existing_user.google_id = google_id
                existing_user.save()
                user = existing_user
            else:
                # Create new user
                user = User(
                    username=name,
                    email=email,
                    google_id=google_id
                )
                user.save()
        
        login_user(user)
        return redirect(url_for("home"))
    
    flash("Failed to get user info from Google.", "error")
    return redirect(url_for("login"))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    
    error = None
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        if password != confirm_password:
            error = 'Passwords do not match'
        elif User.get_by_username(username):
            error = 'Username already exists'
        elif User.get_by_email(email):
            error = 'Email already registered'
        else:
            user = User(username=username, email=email)
            user.set_password(password)
            user.save()
            
            login_user(user)
            return redirect(url_for('home'))
    
    return render_template('auth/register.html', error=error)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/')
@login_required
def home():
    """Render the main dashboard page"""
    return render_template('index.html')

@app.route('/webhook', methods=['POST'])
def webhook():
    """Endpoint for receiving Discord webhook messages"""
    try:
        data = request.json
        if not data:
            logger.warning("Received empty webhook request")
            return jsonify({"status": "error", "message": "No data provided"}), 400
        
        # Process the Discord message
        result = discord_service.process_message(data)
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/discord_trades', methods=['GET'])
@login_required
def get_discord_trades():
    """API endpoint for getting Discord trades"""
    try:
        # Try to read from the log file
        trades = []
        if os.path.exists('discord_trades.log'):
            with open('discord_trades.log', 'r') as f:
                for line in f:
                    try:
                        entry = json.loads(line.strip())
                        trades.append({
                            "alert": entry.get('message', ''),
                            "time": entry.get('time', ''),
                            "source": "Discord"
                        })
                    except:
                        continue
        
        # If no trades found, return sample data
        if not trades:
            trades = [
                {"alert": "BOUGHT NDX 20700C 3/6 16 - 1 cont", "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "source": "Discord"},
                {"alert": "SOLD AAPL 190P 3/10 4 - 3 cont", "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "source": "Discord"}
            ]
        
        return jsonify(trades)
    except Exception as e:
        logger.error(f"Error getting discord trades: {str(e)}")
        return jsonify([]), 500

@app.route('/api/trades', methods=['GET'])
@login_required
def get_trades():
    """API endpoint for getting all trades"""
    try:
        db_trades = Trade.get_all(limit=50)
        trades_json = []
        
        for trade in db_trades:
            trades_json.append({
                "id": trade.id,
                "symbol": trade.symbol,
                "price": trade.price,
                "quantity": trade.quantity,
                "type": trade.trade_type,
                "time": trade.timestamp,
                "source": trade.source
            })
        
        return jsonify(trades_json)
    except Exception as e:
        logger.error(f"Error getting trades: {str(e)}")
        return jsonify([]), 500

@app.route('/api/portfolio', methods=['GET'])
@login_required
def get_portfolio():
    """API endpoint for getting portfolio data"""
    try:
        # For now, return sample data
        portfolio_data = {
            "total_value": "$50,234.12",
            "daily_pnl": "+$123.45",
            "positions": "AAPL (40), TSLA (30)"
        }
        
        return jsonify(portfolio_data)
    except Exception as e:
        logger.error(f"Error getting portfolio data: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/market/indices', methods=['GET'])
@login_required
def get_market_indices():
    """API endpoint for getting major market indices data"""
    try:
        from services.api.market_data import market_data_service
        
        indices = market_data_service.get_major_indices()
        
        return jsonify(indices)
    except Exception as e:
        logger.error(f"Error getting market indices: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/market/quote/<symbol>', methods=['GET'])
@login_required
def get_stock_quote(symbol):
    """API endpoint for getting data for a specific stock"""
    try:
        from services.api.market_data import market_data_service
        
        quote = market_data_service.get_quote(symbol.upper())
        
        if quote:
            return jsonify(quote)
        else:
            return jsonify({"error": f"Could not fetch data for {symbol}"}), 404
    except Exception as e:
        logger.error(f"Error getting stock quote for {symbol}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/market/quotes', methods=['GET'])
@login_required
def get_multiple_quotes():
    """API endpoint for getting data for multiple stocks"""
    try:
        from services.api.market_data import market_data_service
        
        symbols = request.args.get('symbols', '')
        if not symbols:
            return jsonify({"error": "No symbols provided"}), 400
        
        symbol_list = [s.strip().upper() for s in symbols.split(',')]
        quotes = market_data_service.get_multiple_quotes(symbol_list)
        
        return jsonify(quotes)
    except Exception as e:
        logger.error(f"Error getting multiple stock quotes: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=Config.DEBUG)