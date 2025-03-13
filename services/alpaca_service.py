import os
import logging
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

# Alpaca API configuration
ALPACA_API_KEY = os.getenv('ALPACA_API_KEY')
ALPACA_SECRET_KEY = os.getenv('ALPACA_SECRET_KEY')
ALPACA_BASE_URL = 'https://paper-api.alpaca.markets'
ALPACA_DATA_URL = 'https://data.alpaca.markets'

def fetch_stock_data(symbol):
    """
    Fetch real-time stock data from Alpaca API
    
    Args:
        symbol (str): Stock symbol to fetch data for
    
    Returns:
        dict: Stock data or mock data if API call fails
    """
    if not ALPACA_API_KEY or not ALPACA_SECRET_KEY:
        logger.warning("Alpaca API keys not configured. Returning mock data.")
        return {
            'symbol': symbol,
            'price': 100.50,
            'change': 1.25,
            'volume': 1000000,
            'mock_data': True
        }
    
    try:
        headers = {
            'APCA-API-KEY-ID': ALPACA_API_KEY,
            'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY
        }
        
        # Implement actual Alpaca API call here
        # This is a placeholder - you'll need to replace with actual Alpaca API implementation
        response = requests.get(f'{ALPACA_DATA_URL}/v2/stocks/{symbol}/snapshot', headers=headers)
        response.raise_for_status()
        
        data = response.json()
        return {
            'symbol': symbol,
            'price': data.get('latestTrade', {}).get('p', 0),
            'change': 0,  # Calculate change based on Alpaca response
            'volume': data.get('latestTrade', {}).get('v', 0)
        }
    
    except Exception as e:
        logger.error(f"Error fetching stock data for {symbol}: {e}")
        return {
            'symbol': symbol,
            'price': 100.50,
            'change': 1.25,
            'volume': 1000000,
            'mock_data': True
        }

def get_alpaca_portfolio():
    """
    Retrieve user's Alpaca portfolio
    
    Returns:
        dict: Portfolio information or mock data
    """
    if not ALPACA_API_KEY or not ALPACA_SECRET_KEY:
        logger.warning("Alpaca API keys not configured. Returning mock portfolio.")
        return {
            'cash': 10000,
            'positions': [],
            'total_value': 10000,
            'mock_data': True
        }
    
    try:
        headers = {
            'APCA-API-KEY-ID': ALPACA_API_KEY,
            'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY
        }
        
        # Implement actual Alpaca portfolio retrieval
        account_response = requests.get(f'{ALPACA_BASE_URL}/v2/account', headers=headers)
        positions_response = requests.get(f'{ALPACA_BASE_URL}/v2/positions', headers=headers)
        
        account_response.raise_for_status()
        positions_response.raise_for_status()
        
        account_data = account_response.json()
        positions_data = positions_response.json()
        
        return {
            'cash': float(account_data.get('cash', 0)),
            'positions': positions_data,
            'total_value': float(account_data.get('equity', 0)),
            'mock_data': False
        }
    
    except Exception as e:
        logger.error(f"Error fetching Alpaca portfolio: {e}")
        return {
            'cash': 10000,
            'positions': [],
            'total_value': 10000,
            'mock_data': True
        }