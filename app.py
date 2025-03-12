from flask import Flask, render_template, jsonify, request
from alpaca_trade_api.rest import REST
from waitress import serve
import os
import time
from dotenv import load_dotenv

print("Loading environment variables...")
load_dotenv()

print("Initializing Flask app...")
app = Flask(__name__, template_folder='frontend')

print("Initializing Alpaca API...")
alpaca = REST(os.getenv('ALPACA_API_KEY'), os.getenv('ALPACA_SECRET_KEY'), base_url='https://paper-api.alpaca.markets')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/portfolio')
def portfolio():
    try:
        account = alpaca.get_account()
        return {
            'total_value': f"${float(account.equity):,.2f}",
            'daily_pnl': f"${float(account.equity) - float(account.last_equity):,.2f}",
            'positions': ', '.join([f"{pos.symbol} ({pos.qty})" for pos in alpaca.list_positions()])
        }
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/trades')
def trades():
    try:
        trades = alpaca.get_activities('FILL')[:5]
        return [{'symbol': t.symbol, 'type': t.side, 'quantity': t.qty, 'price': t.price, 'time': t.transaction_time} for t in trades]
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/market_data')
def market_data():
    try:
        symbols = ['AAPL', 'TSLA', 'NVDA']
        bars = alpaca.get_latest_trades(symbols)
        return {symbol: {'price': float(bars[symbol].price), 'time': bars[symbol].timestamp} for symbol in symbols}
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/discord_trades')
def discord_trades():
    print("Fetching Discord trades...")
    try:
        with open('discord_trades.log', 'r') as f:
            lines = f.readlines()[-5:]
        trades = []
        for line in lines:
            parts = line.strip().split(' [')
            if len(parts) >= 2:
                content, time = parts[0], parts[1][:-1]
                words = content.split()
                if len(words) >= 5 and words[0] in ['Buy', 'Sell']:
                    trades.append({
                        'symbol': words[1],
                        'type': words[0],
                        'quantity': words[2],
                        'price': words[4].replace('$', ''),
                        'time': time,
                        'source': 'Discord Notification'
                    })
        return trades
    except FileNotFoundError:
        return [
            {'symbol': 'TSLA', 'type': 'Buy', 'quantity': '10', 'price': '255.32', 'time': '2025-03-11 10:32:00', 'source': 'Discord Notification'},
            {'symbol': 'AAPL', 'type': 'Sell', 'quantity': '5', 'price': '172.10', 'time': '2025-03-11 09:45:00', 'source': 'Discord Notification'}
        ]
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/webhook', methods=['POST'])
def webhook():
    try:
        data = request.get_json()
        if data and 'alert' in data:
            alert = data['alert']
            words = alert.split()
            if len(words) >= 5 and words[0] in ['Buy', 'Sell']:
                trade = {
                    'symbol': words[1],
                    'type': words[0],
                    'quantity': words[2],
                    'price': words[4].replace('$', ''),
                    'time': data.get('time', time.strftime('%Y-%m-%d %H:%M:%S')),
                    'source': 'Discord Notification'
                }
                with open('discord_trades.log', 'a') as f:
                    f.write(f"{alert} [{trade['time']}]\n")
                return jsonify({'status': 'received', 'trade': trade}), 200
        return jsonify({'status': 'no valid alert'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    print(f"Starting server on port {port}...")
    serve(app, host='0.0.0.0', port=port)