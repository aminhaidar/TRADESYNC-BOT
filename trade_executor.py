import logging
import re
from flask import Flask, request
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest, LimitOrderRequest, StopLimitOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("trade_executor.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger()

# Alpaca API credentials (replace with your own)
ALPACA_API_KEY = "Ne24vw64udU8VV1HrKryezMQS"  # Get from Alpaca dashboard
ALPACA_SECRET_KEY = "5FOdMlQJE7iE8OEWwPI6qc0QXfhYub3Pq8RG8OpHDZSK4rK1kh"  # Get from Alpaca dashboard
trading_client = TradingClient(ALPACA_API_KEY, ALPACA_SECRET_KEY, paper=True)  # Paper=True for testing

# Flask app for webhook
app = Flask(__name__)

# Default trade settings
DEFAULT_QUANTITY = 1  # Number of contracts or shares

def parse_tweet(tweet_text):
    """Parse tweet text into actionable trade data"""
    trade_data = {
        "action": None,
        "symbol": None,
        "instrument": None,
        "strike": None,
        "expiration": None,
        "entry_price": None,
        "target_price": None,
        "stop_loss": None
    }
    
    text = tweet_text.lower()
    
    if "buying" in text or "long" in text:
        trade_data["action"] = "buy"
    elif "shorting" in text or "short" in text:
        trade_data["action"] = "short"
    elif "closed" in text or "closing" in text:
        trade_data["action"] = "close"
    
    symbol_match = re.search(r'\$[a-zA-Z]+', text)
    if symbol_match:
        trade_data["symbol"] = symbol_match.group(0).upper().replace("$", "")
    
    if "call" in text or "calls" in text:
        trade_data["instrument"] = "call"
    elif "put" in text or "puts" in text:
        trade_data["instrument"] = "put"
    else:
        trade_data["instrument"] = "stock"
    
    strike_match = re.search(r'(\d+)\s*(calls|puts)', text)
    if strike_match:
        trade_data["strike"] = float(strike_match.group(1))
    
    exp_match = re.search(r'exp\s*(\d+/\d+)', text)
    if exp_match:
        trade_data["expiration"] = exp_match.group(1)
    
    price_matches = re.findall(r'at\s*(\d+\.?\d*)|entry\s*(\d+\.?\d*)|target\s*(\d+\.?\d*)|stop\s*(?:loss)?\s*(\d+\.?\d*)', text)
    for match in price_matches:
        if match[0] or match[1]:
            trade_data["entry_price"] = float(match[0] or match[1])
        elif match[2]:
            trade_data["target_price"] = float(match[2])
        elif match[3]:
            trade_data["stop_loss"] = float(match[3])
    
    return trade_data

def execute_trade(trade_data):
    """Execute a trade based on parsed tweet data"""
    try:
        if not trade_data["action"] or not trade_data["symbol"]:
            logger.info("No actionable trade data found")
            return
        
        symbol = trade_data["symbol"]
        action = trade_data["action"]
        instrument = trade_data["instrument"]
        entry_price = trade_data["entry_price"]
        target_price = trade_data["target_price"]
        stop_loss = trade_data["stop_loss"]
        strike = trade_data["strike"]
        expiration = trade_data["expiration"]

        if instrument == "stock":
            if action == "buy":
                order = LimitOrderRequest(
                    symbol=symbol,
                    qty=DEFAULT_QUANTITY,
                    side=OrderSide.BUY,
                    time_in_force=TimeInForce.GTC,
                    limit_price=entry_price
                )
                logger.info(f"Placing buy order for {symbol} at {entry_price}")
                trading_client.submit_order(order)
            
            elif action == "short":
                order = MarketOrderRequest(
                    symbol=symbol,
                    qty=DEFAULT_QUANTITY,
                    side=OrderSide.SELL,
                    time_in_force=TimeInForce.GTC
                )
                logger.info(f"Placing short order for {symbol} at market price")
                trading_client.submit_order(order)
                if target_price:
                    cover_order = LimitOrderRequest(
                        symbol=symbol,
                        qty=DEFAULT_QUANTITY,
                        side=OrderSide.BUY,
                        time_in_force=TimeInForce.GTC,
                        limit_price=target_price
                    )
                    trading_client.submit_order(cover_order)
            
            elif action == "close":
                logger.info(f"Closing position for {symbol}")
                trading_client.close_position(symbol)

        elif instrument in ("call", "put"):
            if strike and expiration:
                exp_date = f"25{expiration.replace('/', '')}"
                strike_str = f"{int(strike * 1000):08d}"
                option_type = "C" if instrument == "call" else "P"
                option_symbol = f"{symbol}{exp_date}{option_type}{strike_str}"
            else:
                logger.error("Missing strike or expiration for options trade")
                return

            if action == "buy":
                order = LimitOrderRequest(
                    symbol=option_symbol,
                    qty=DEFAULT_QUANTITY,
                    side=OrderSide.BUY,
                    time_in_force=TimeInForce.GTC,
                    limit_price=entry_price
                )
                logger.info(f"Placing buy order for {option_symbol} at {entry_price}")
                trading_client.submit_order(order)
                if target_price:
                    sell_order = LimitOrderRequest(
                        symbol=option_symbol,
                        qty=DEFAULT_QUANTITY,
                        side=OrderSide.SELL,
                        time_in_force=TimeInForce.GTC,
                        limit_price=target_price
                    )
                    trading_client.submit_order(sell_order)
                if stop_loss:
                    stop_order = StopLimitOrderRequest(
                        symbol=option_symbol,
                        qty=DEFAULT_QUANTITY,
                        side=OrderSide.SELL,
                        time_in_force=TimeInForce.GTC,
                        limit_price=stop_loss,
                        stop_price=stop_loss
                    )
                    trading_client.submit_order(stop_order)
            
            elif action == "close":
                logger.info(f"Closing position for {option_symbol}")
                trading_client.close_position(option_symbol)

    except Exception as e:
        logger.error(f"Error executing trade: {e}")

@app.route('/webhook', methods=['POST'])
def webhook():
    """Receive tweet data from twitter_monitor.py"""
    tweet_data = request.get_json()
    if not tweet_data:
        logger.error("No data received in webhook")
        return {"status": "error", "message": "No data"}, 400
    
    username = tweet_data.get("username", "unknown")
    tweet_text = tweet_data.get("content", "")
    tweet_id = tweet_data.get("tweet_id", "unknown")
    
    logger.info(f"Received tweet from @{username} (ID: {tweet_id}): {tweet_text}")
    parsed_data = parse_tweet(tweet_text)
    logger.info(f"Parsed trade data: {parsed_data}")
    execute_trade(parsed_data)
    return {"status": "success"}, 200

if __name__ == "__main__":
    logger.info("Starting trade executor webhook server on port 5000...")
    app.run(host="0.0.0.0", port=5000)
