import os
import logging
from flask import Flask, request, jsonify
from transformers import pipeline
from webull import webull
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Set up transformers pipeline for question-answering
try:
    nlp = pipeline("question-answering", model="distilbert-base-uncased-distilled-squad")
    logger.info("Transformers pipeline initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize transformers pipeline: {e}")
    exit(1)

# Get Webull credentials from environment variables
WEBULL_EMAIL = os.getenv("WEBULL_EMAIL")
WEBULL_PASSWORD = os.getenv("WEBULL_PASSWORD")
WEBULL_SMS_CODE = os.getenv("WEBULL_SMS_CODE")

# Validate environment variables
if not all([WEBULL_EMAIL, WEBULL_PASSWORD, WEBULL_SMS_CODE]):
    logger.error("Missing Webull credentials in environment variables")
    exit(1)

# Initialize Webull client
wb = webull()

# Enhanced Webull login with MFA and retry logic
def login_to_webull(max_retries=3, delay=5):
    attempt = 0
    while attempt < max_retries:
        try:
            logger.info(f"Attempting Webull login (Attempt {attempt + 1}/{max_retries})")
            wb.login(WEBULL_EMAIL, WEBULL_PASSWORD)
            # Handle MFA if required (per wiki documentation)
            if wb._session.cookies.get("mfa_required"):
                wb.get_trade_token(WEBULL_SMS_CODE)
                logger.info("MFA token applied successfully")
            if wb._session.cookies.get("token"):
                logger.info("Webull login successful")
                return True
            else:
                raise Exception("Login failed, no token received")
        except Exception as e:
            attempt += 1
            logger.error(f"Login attempt failed: {e}")
            if attempt < max_retries:
                time.sleep(delay)
            else:
                logger.error("Max login attempts reached, aborting")
                return False
    return False

# Attempt login
if not login_to_webull():
    exit(1)

# Webhook endpoint to receive Discord notifications
@app.route('/webhook', methods=['POST'])
def webhook():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            logger.error("No message provided in webhook data")
            return jsonify({"error": "No message provided"}), 400

        message = data['message']
        timestamp = data.get('timestamp', '')
        logger.info(f"Received webhook data: {message} at {timestamp}")

        # Parse trade signal using transformers
        question = "What is the trade signal?"
        context = message
        result = nlp(question=question, context=context)
        trade_signal = result['answer'].lower()
        logger.info(f"Parsed trade signal: {trade_signal}")

        # Execute trade logic
        response = {"status": "no_action", "signal": trade_signal, "timestamp": timestamp}
        if "buy" in trade_signal:
            try:
                wb.place_order(symbol="AAPL", qty=1, action="buy", order_type="limit", price=150.00)
                logger.info("Buy order placed for AAPL")
                response = {"status": "success", "action": "buy", "signal": trade_signal, "timestamp": timestamp}
            except Exception as e:
                logger.error(f"Buy order failed: {e}")
                response = {"status": "error", "action": "buy", "error": str(e), "timestamp": timestamp}
        elif "sell" in trade_signal:
            try:
                wb.place_order(symbol="AAPL", qty=1, action="sell", order_type="limit", price=150.00)
                logger.info("Sell order placed for AAPL")
                response = {"status": "success", "action": "sell", "signal": trade_signal, "timestamp": timestamp}
            except Exception as e:
                logger.error(f"Sell order failed: {e}")
                response = {"status": "error", "action": "sell", "error": str(e), "timestamp": timestamp}

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Webhook processing failed: {e}")
        return jsonify({"error": str(e)}), 500

# Run the app with Waitress for production
if __name__ == "__main__":
    from waitress import serve
    logger.info("Starting Flask app with Waitress on 0.0.0.0:5000")
    try:
        serve(app, host="0.0.0.0", port=5000)
    except Exception as e:
        logger.error(f"Server failed to start: {e}")
        exit(1)