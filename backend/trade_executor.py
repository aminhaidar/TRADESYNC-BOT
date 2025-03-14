import logging
import os
from alpaca_trade_api.rest import REST
from dotenv import load_dotenv

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("logs/trade_executor.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)

load_dotenv()
ALPACA_API_KEY = os.getenv('ALPACA_API_KEY')
ALPACA_SECRET_KEY = os.getenv('ALPACA_SECRET_KEY')
ALPACA_BASE_URL = 'https://paper-api.alpaca.markets'

# Initialize Alpaca client
alpaca_client = None
if ALPACA_API_KEY and ALPACA_SECRET_KEY:
    try:
        alpaca_client = REST(ALPACA_API_KEY, ALPACA_SECRET_KEY, base_url=ALPACA_BASE_URL)
        logger.info("Alpaca client initialized successfully for trade execution")
    except Exception as e:
        logger.error(f"Failed to initialize Alpaca client for trade execution: {str(e)}")
else:
    logger.warning("Alpaca API keys not configured for trade execution. Will simulate trades.")

def execute_trade(trade_data):
    """
    Execute a trade using Alpaca API.
    
    Args:
        trade_data (dict): Trade details including symbol, action, price, etc.
    
    Returns:
        dict: Result of trade execution or mock result
    """
    try:
        if not alpaca_client:
            logger.warning("Alpaca client not initialized. Simulating trade execution.")
            return {"status": "success", "message": f"Simulated trade: {trade_data}"}
        
        symbol = trade_data.get("symbol")
        action = trade_data.get("action").lower()
        quantity = trade_data.get("contracts", 1)
        
        if not symbol or not action or not quantity:
            raise ValueError("Missing required trade parameters: symbol, action, or quantity")
        
        # Determine side (buy/sell)
        side = "buy" if action == "BUY" else "sell"
        
        # Submit order to Alpaca
        order = alpaca_client.submit_order(
            symbol=symbol,
            qty=quantity,
            side=side,
            type="market",
            time_in_force="gtc"  # Good till canceled
        )
        
        logger.info(f"Trade executed: {order}")
        return {
            "status": "success",
            "message": f"Trade executed: {order.id}",
            "order_id": order.id,
            "symbol": order.symbol,
            "side": order.side,
            "qty": order.qty,
            "filled_qty": order.filled_qty,
            "status": order.status
        }
    except Exception as e:
        logger.error(f"Error executing trade: {str(e)}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    trade = {"symbol": "AAPL", "action": "BUY", "contracts": 1}  # Reduced quantity to 1
    result = execute_trade(trade)
    print(result)