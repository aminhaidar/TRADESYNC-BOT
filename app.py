from flask import Flask, request, render_template, jsonify, redirect, url_for, flash, session
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_wtf.csrf import CSRFProtect
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

if __name__ == '__main__':
    app.run(debug=Config.DEBUG)