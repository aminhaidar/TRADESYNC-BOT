import os
import logging
import requests
from alpaca_trade_api.rest import REST
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

# Alpaca API configuration
ALPACA_API_KEY = os.getenv('ALPACA_API_KEY')
ALPACA_SECRET_KEY = os.getenv('ALPACA_SECRET_KEY')
ALPACA_BASE_URL = 'https://paper-api.alpaca.markets'  # Use paper trading for testing
ALPACA_DATA_URL = 'https://data.alpaca.markets'

# Initialize Alpaca client
alpaca_client = None
if ALPACA_API_KEY and ALPACA_SECRET_KEY:
    try:
        alpaca_client = REST(ALPACA_API_KEY, ALPACA_SECRET_KEY, base_url=ALPACA_BASE_URL)
        logger.info("Alpaca client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Alpaca client: {str(e)}")
else:
    logger.warning("Alpaca API keys not configured. Will use mock data.")

def fetch_stock_data(symbol):
    """
    Fetch real-time stock data from Alpaca API.
    
    Args:
        symbol (str): Stock symbol to fetch data for
    
    Returns:
        dict: Stock data or mock data if API call fails
    """
    if not alpaca_client:
        logger.warning("Alpaca client not initialized. Returning mock data.")
        return {
            'symbol': symbol,
            'price': 100.50,
            'change': 1.25,
            'volume': 1000000,
            'mock_data': True
        }
    
    try:
        # Fetch snapshot data from Alpaca
        snapshot = alpaca_client.get_snapshot(symbol)
        if not snapshot:
            raise ValueError("No snapshot data returned")
        
        return {
            'symbol': symbol,
            'price': snapshot.latest_trade.price,
            'change': snapshot.daily_bar.change,
            'volume': snapshot.latest_trade.size
        }
    except Exception as e:
        logger.error(f"Error fetching stock data for {symbol}: {str(e)}")
        return {
            'symbol': symbol,
            'price': 100.50,
            'change': 1.25,
            'volume': 1000000,
            'mock_data': True
        }

def get_alpaca_portfolio():
    """
    Retrieve user's Alpaca portfolio.
    
    Returns:
        dict: Portfolio information or mock data
    """
    if not alpaca_client:
        logger.warning("Alpaca client not initialized. Returning mock portfolio.")
        return {
            'cash': 10000,
            'positions': [],
            'total_value': 10000,
            'mock_data': True
        }
    
    try:
        # Fetch account and positions from Alpaca
        account = alpaca_client.get_account()
        positions = alpaca_client.list_positions()
        
        portfolio = {
            'cash': float(account.cash),
            'positions': [
                {
                    'symbol': pos.symbol,
                    'qty': int(pos.qty),
                    'avg_entry_price': float(pos.avg_entry_price),
                    'current_price': float(pos.current_price),
                    'market_value': float(pos.market_value),
                    'profit_loss': float(pos.unrealized_pl)
                } for pos in positions
            ],
            'total_value': float(account.equity),
            'mock_data': False
        }
        return portfolio
    except Exception as e:
        logger.error(f"Error fetching Alpaca portfolio: {str(e)}")
        return {
            'cash': 10000,
            'positions': [],
            'total_value': 10000,
            'mock_data': True
        }