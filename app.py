from dotenv import load_dotenv
import os
import logging
from flask import Flask, request, jsonify
from alpaca_trade_api.rest import REST

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Debug: Verify environment variables
logger.info(f"ALPACA_API_KEY from env: {os.getenv('ALPACA_API_KEY')}")
logger.info(f"ALPACA_SECRET_KEY from env: {os.getenv('ALPACA_SECRET_KEY')}")

# Initialize Flask app
app = Flask(__name__)

# Retrieve Alpaca API credentials with validation
ALPACA_API_KEY = os.getenv("ALPACA_API_KEY")
ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")

if not ALPACA_API_KEY or not ALPACA_SECRET_KEY:
    logger.error("ALPACA_API_KEY or ALPACA_SECRET_KEY not set in environment variables")
    exit(1)

# Initialize Alpaca REST client for paper trading
try:
    api = REST(
        key_id=ALPACA_API_KEY,
        secret_key=ALPACA_SECRET_KEY,
        base_url="https://paper-api.alpaca.markets",
        api_version="v2"
    )
    account = api.get_account()
    logger.info(f"Connected to Alpaca account: {account.account_number}")
except Exception as e:
    logger.error(f"Failed to connect to Alpaca: {e}")
    exit(1)

# Webhook endpoint
@app.route('/webhook', methods=['POST'])
def webhook():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            logger.error("No message provided in webhook data")
            return jsonify({"error": "No message provided"}), 400

        message = data['message'].lower().strip()
        timestamp = data.get('timestamp', '')
        logger.info(f"Received webhook data: {message} at {timestamp}")

        response = {"status": "no_action", "timestamp": timestamp}
        if "buy" in message:
            try:
                order = api.submit_order(
                    symbol="AAPL",
                    qty=1,
                    side="buy",
                    type="market",
                    time_in_force="gtc"
                )
                logger.info(f"Buy order placed for AAPL: {order.id}")
                response = {"status": "success", "action": "buy", "order_id": order.id, "timestamp": timestamp}
            except Exception as e:
                logger.error(f"Buy order failed: {e}")
                response = {"status": "error", "action": "buy", "error": str(e), "timestamp": timestamp}
        elif "sell" in message:
            try:
                order = api.submit_order(
                    symbol="AAPL",
                    qty=1,
                    side="sell",
                    type="market",
                    time_in_force="gtc"
                )
                logger.info(f"Sell order placed for AAPL: {order.id}")
                response = {"status": "success", "action": "sell", "order_id": order.id, "timestamp": timestamp}
            except Exception as e:
                logger.error(f"Sell order failed: {e}")
                response = {"status": "error", "action": "sell", "error": str(e), "timestamp": timestamp}

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Webhook processing failed: {e}")
        return jsonify({"error": str(e)}), 500

# Run the app with Waitress
if __name__ == "__main__":
    from waitress import serve
    logger.info("Starting Flask app with Waitress on 0.0.0.0:5000")
    try:
        serve(app, host="0.0.0.0", port=5000)
    except Exception as e:
        logger.error(f"Server failed to start: {e}")
        exit(1)