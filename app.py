from flask import Flask, request, jsonify
from alpaca_trade_api.rest import REST
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Alpaca credentials (set as environment variables or replace with keys)
ALPACA_API_KEY = os.getenv("PKPZL11RIWG5Q3NU2TZ1", "your_api_key")
ALPACA_SECRET_KEY = os.getenv("ZANCgFnbUOIHvaLtkRPbA5RpaHvxfVUdVDVjxTJg", "your_secret_key")

api = REST(key_id=ALPACA_API_KEY, secret_key=ALPACA_SECRET_KEY, base_url="https://paper-api.alpaca.markets")

@app.route('/webhook', methods=['POST'])
def webhook():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            logger.error("No message provided")
            return jsonify({"error": "No message provided"}), 400

        message = data['message'].lower()
        logger.info(f"Received webhook: {message}")

        if "buy" in message:
            api.submit_order(symbol="AAPL", qty=1, side="buy", type="market", time_in_force="gtc")
            logger.info("Buy order placed")
            return jsonify({"status": "success", "action": "buy"}), 200
        elif "sell" in message:
            api.submit_order(symbol="AAPL", qty=1, side="sell", type="market", time_in_force="gtc")
            logger.info("Sell order placed")
            return jsonify({"status": "success", "action": "sell"}), 200
        else:
            return jsonify({"status": "no_action"}), 200
    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    from waitress import serve
    logger.info("Starting Flask app on 0.0.0.0:5000")
    serve(app, host="0.0.0.0", port=5000)