from flask import Flask, render_template, jsonify
from alpaca_trade_api.rest import REST
from waitress import serve
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, template_folder='frontend')
alpaca = REST(os.getenv('ALPACA_API_KEY'), os.getenv('ALPACA_SECRET_KEY'), base_url='https://paper-api.alpaca.markets')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/portfolio')
def portfolio():
    account = alpaca.get_account()
    return {
        'total_value': f"${float(account.equity):,.2f}",
        'daily_pnl': f"${float(account.equity) - float(account.last_equity):,.2f}",
        'positions': ', '.join([f"{pos.symbol} ({pos.qty})" for pos in alpaca.list_positions()])
    }

@app.route('/api/trades')
def trades():
    trades = alpaca.get_activities('FILL')[:5]
    return [{'symbol': t.symbol, 'type': t.side, 'quantity': t.qty, 'price': t.price, 'time': t.transaction_time} for t in trades]

@app.route('/api/market_data')
def market_data():
    symbols = ['AAPL', 'TSLA', 'NVDA']
    bars = alpaca.get_latest_trades(symbols)
    return {symbol: {'price': float(bars[symbol].price), 'time': bars[symbol].timestamp} for symbol in symbols}

@app.route('/api/discord_trades')
def discord_trades():
    # Mock Discord trades (replace with real logic later)
    return [
        {'symbol': 'TSLA', 'type': 'Buy', 'quantity': '10', 'price': '255.32', 'time': '2025-03-11 10:32:00', 'source': 'Discord Alert'},
        {'symbol': 'AAPL', 'type': 'Sell', 'quantity': '5', 'price': '172.10', 'time': '2025-03-11 09:45:00', 'source': 'Discord Alert'}
    ]

@app.route('/webhook', methods=['POST'])
def webhook():
    # Placeholder for Discord alert processing
    return jsonify({'status': 'received'}), 200

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    serve(app, host='0.0.0.0', port=port)