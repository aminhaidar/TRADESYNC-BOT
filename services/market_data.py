import requests
import json
from datetime import datetime
from utils.logger import setup_logger

# Set up logger
logger = setup_logger('market_data', 'market_data.log')

class MarketDataService:
    def __init__(self, api_key=None):
        self.api_key = api_key or 'demo'  # Default to demo mode if no API key provided
        self.yahoo_url = 'https://query1.finance.yahoo.com/v8/finance/chart/'
    
    def get_major_indices(self):
        """Get real-time data for major market indices"""
        try:
            # Symbols for major indices
            symbols = {
                'S&P 500': '^GSPC',
                'Dow Jones': '^DJI',
                'NASDAQ': '^IXIC',
                'VIX': '^VIX',
                'Russell 2000': '^RUT'
            }
            
            result = {}
            
            for name, symbol in symbols.items():
                data = self.get_quote(symbol)
                if data:
                    result[name] = data
                else:
                    # Fallback to mock data if API fails
                    result[name] = self._get_fallback_data(name)
            
            return result
        except Exception as e:
            logger.error(f"Error fetching indices: {str(e)}")
            return self._get_fallback_indices()
    
    def get_quote(self, symbol):
        """Get real-time stock quote data for any symbol"""
        try:
            url = f"{self.yahoo_url}{symbol}"
            params = {
                'interval': '1d',
                'range': '1d'
            }
            
            response = requests.get(url, params=params)
            data = response.json()
            
            if 'chart' in data and 'result' in data['chart'] and data['chart']['result']:
                quote_data = data['chart']['result'][0]
                meta = quote_data['meta']
                
                # Get the latest price
                current_price = meta.get('regularMarketPrice', 0)
                
                # Get the previous close
                previous_close = meta.get('previousClose', 0)
                
                # Calculate change and percentage
                change = current_price - previous_close
                change_percent = (change / previous_close) * 100 if previous_close else 0
                
                # Get additional info if available
                company_name = meta.get('shortName', '')
                
                return {
                    'symbol': meta.get('symbol', symbol),
                    'name': company_name,
                    'price': current_price,
                    'change': change,
                    'change_percent': change_percent,
                    'volume': meta.get('regularMarketVolume', 0),
                    'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }
            else:
                logger.warning(f"Failed to get quote for {symbol}")
                return None
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {str(e)}")
            return None
    
    def get_multiple_quotes(self, symbols):
        """Get quotes for multiple symbols"""
        result = {}
        for symbol in symbols:
            quote = self.get_quote(symbol)
            if quote:
                result[symbol] = quote
            else:
                result[symbol] = self._get_fallback_stock_data(symbol)
        return result
    
    def _get_fallback_indices(self):
        """Return fallback data for major indices if API fails"""
        return {
            'S&P 500': {
                'symbol': '^GSPC',
                'name': 'S&P 500',
                'price': 5628.87,
                'change': 23.87,
                'change_percent': 0.43,
                'volume': 2500000000,
                'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            },
            'Dow Jones': {
                'symbol': '^DJI',
                'name': 'Dow Jones Industrial Average',
                'price': 43124.34,
                'change': 127.45,
                'change_percent': 0.30,
                'volume': 350000000,
                'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            },
            'NASDAQ': {
                'symbol': '^IXIC',
                'name': 'NASDAQ Composite',
                'price': 17891.50,
                'change': 98.64,
                'change_percent': 0.55,
                'volume': 4800000000,
                'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            },
            'VIX': {
                'symbol': '^VIX',
                'name': 'CBOE Volatility Index',
                'price': 14.32,
                'change': -0.89,
                'change_percent': -5.85,
                'volume': 0,
                'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            },
            'Russell 2000': {
                'symbol': '^RUT',
                'name': 'Russell 2000',
                'price': 2187.29,
                'change': 15.76,
                'change_percent': 0.73,
                'volume': 950000000,
                'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
        }
    
    def _get_fallback_data(self, index_name):
        """Return fallback data for a specific index if API fails"""
        fallback_data = self._get_fallback_indices()
        return fallback_data.get(index_name, self._get_fallback_stock_data('UNKNOWN'))
    
    def _get_fallback_stock_data(self, symbol):
        """Return fallback data for a stock if API fails"""
        # Provide some realistic mock data for common stocks
        fallback_stocks = {
            'AAPL': {
                'symbol': 'AAPL',
                'name': 'Apple Inc.',
                'price': 182.45,
                'change': 0.87,
                'change_percent': 0.48,
                'volume': 65000000,
                'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            },
            'MSFT': {
                'symbol': 'MSFT',
                'name': 'Microsoft Corporation',
                'price': 425.78,
                'change': 2.35,
                'change_percent': 0.56,
                'volume': 28000000,
                'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            },
            'AMZN': {
                'symbol': 'AMZN',
                'name': 'Amazon.com, Inc.',
                'price': 183.92,
                'change': 1.23,
                'change_percent': 0.67,
                'volume': 35000000,
                'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            },
            'GOOGL': {
                'symbol': 'GOOGL',
                'name': 'Alphabet Inc.',
                'price': 176.34,
                'change': 0.92,
                'change_percent': 0.52,
                'volume': 25000000,
                'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            },
            'TSLA': {
                'symbol': 'TSLA',
                'name': 'Tesla, Inc.',
                'price': 185.67,
                'change': -3.45,
                'change_percent': -1.83,
                'volume': 98000000,
                'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
        }
        
        # Return data for the requested symbol or a generic fallback
        return fallback_stocks.get(symbol, {
            'symbol': symbol,
            'name': f'{symbol} Stock',
            'price': 100.00,
            'change': 0.00,
            'change_percent': 0.00,
            'volume': 1000000,
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })

# Create a singleton instance
market_data_service = MarketDataService()