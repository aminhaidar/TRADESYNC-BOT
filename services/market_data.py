import os
import json
from datetime import datetime
import random
from utils.logger import app_logger as logger

class MarketDataService:
    def __init__(self):
        self.last_update = datetime.now()
        # Initialize with mock data
        self.mock_data = self._generate_mock_data()
        
    def get_major_indices(self):
        """Get data for major market indices"""
        try:
            # Check if we should refresh the mock data (every 60 seconds)
            now = datetime.now()
            if (now - self.last_update).total_seconds() > 60:
                self.mock_data = self._generate_mock_data()
                self.last_update = now
                
            # Return mock indices
            return [
                self._get_mock_data("^GSPC", "S&P 500"),
                self._get_mock_data("^DJI", "Dow Jones"),
                self._get_mock_data("^IXIC", "NASDAQ"),
                self._get_mock_data("^VIX", "VIX"),
                self._get_mock_data("^RUT", "Russell 2000")
            ]
        except Exception as e:
            logger.error(f"Error getting major indices: {str(e)}")
            # Return static mock data as fallback
            return self._get_static_mock_indices()
    
    def get_quote(self, symbol):
        """Get data for a specific symbol"""
        try:
            return self._get_mock_data(symbol)
        except Exception as e:
            logger.error(f"Error fetching quote for {symbol}: {str(e)}")
            return self._get_static_mock_data(symbol)
    
    def get_multiple_quotes(self, symbols):
        """Get data for multiple symbols"""
        try:
            result = []
            
            for symbol in symbols:
                try:
                    quote = self.get_quote(symbol)
                    if quote:
                        result.append(quote)
                except Exception as e:
                    logger.error(f"Error fetching data for {symbol}: {str(e)}")
                    # Add static mock data as fallback
                    result.append(self._get_static_mock_data(symbol))
            
            return result
        except Exception as e:
            logger.error(f"Error getting multiple quotes: {str(e)}")
            return [self._get_static_mock_data(symbol) for symbol in symbols]
    
    def _generate_mock_data(self):
        """Generate fresh mock data with slight variations"""
        base_data = {
            "^GSPC": {"price": 5021.84, "change": 3.95, "changePercent": 0.08},
            "^DJI": {"price": 38996.13, "change": 134.85, "changePercent": 0.35},
            "^IXIC": {"price": 15750.75, "change": -35.31, "changePercent": -0.22},
            "^VIX": {"price": 15.39, "change": 0.75, "changePercent": 5.12},
            "^RUT": {"price": 2038.30, "change": -12.50, "changePercent": -0.61},
            "AAPL": {"price": 172.40, "change": 1.25, "changePercent": 0.73},
            "MSFT": {"price": 402.65, "change": 3.45, "changePercent": 0.86},
            "AMZN": {"price": 178.75, "change": -1.15, "changePercent": -0.64},
            "GOOGL": {"price": 141.80, "change": 0.95, "changePercent": 0.67},
            "TSLA": {"price": 174.93, "change": -3.27, "changePercent": -1.83}
        }
        
        # Add small random variations to make it look like real-time data
        result = {}
        for symbol, data in base_data.items():
            price_change = random.uniform(-2.0, 2.0)
            new_price = data["price"] + price_change
            new_change = data["change"] + price_change
            new_percent = (new_change / new_price) * 100
            
            result[symbol] = {
                "price": new_price,
                "change": new_change,
                "changePercent": new_percent
            }
        
        return result
    
    def _get_mock_data(self, symbol, name=None):
        """Get mock data for a symbol with current timestamp"""
        if name is None:
            name = self._get_stock_name(symbol)
            
        # Get current timestamp
        current_time = datetime.now().strftime("%H:%M:%S")
        
        # Get data from our generated mock data
        data = self.mock_data.get(symbol, {
            "price": 100.00 + random.uniform(-5, 5),
            "change": random.uniform(-2, 2),
            "changePercent": random.uniform(-1, 1)
        })
        
        return {
            "symbol": symbol,
            "name": name,
            "price": data["price"],
            "change": data["change"],
            "changePercent": data["changePercent"],
            "time": current_time
        }
    
    def _get_static_mock_data(self, symbol, name=None):
        """Get static mock data for a symbol (fallback)"""
        if name is None:
            name = self._get_stock_name(symbol)
            
        # Static mock data for different symbols
        mock_data = {
            "^GSPC": {"price": 5021.84, "change": 3.95, "changePercent": 0.08},
            "^DJI": {"price": 38996.13, "change": 134.85, "changePercent": 0.35},
            "^IXIC": {"price": 15750.75, "change": -35.31, "changePercent": -0.22},
            "^VIX": {"price": 15.39, "change": 0.75, "changePercent": 5.12},
            "^RUT": {"price": 2038.30, "change": -12.50, "changePercent": -0.61},
            "AAPL": {"price": 172.40, "change": 1.25, "changePercent": 0.73},
            "MSFT": {"price": 402.65, "change": 3.45, "changePercent": 0.86},
            "AMZN": {"price": 178.75, "change": -1.15, "changePercent": -0.64},
            "GOOGL": {"price": 141.80, "change": 0.95, "changePercent": 0.67},
            "TSLA": {"price": 174.93, "change": -3.27, "changePercent": -1.83}
        }
        
        # Default mock data
        default_mock = {"price": 100.00, "change": 0.50, "changePercent": 0.50}
        
        # Get mock data for the symbol or use default
        data = mock_data.get(symbol, default_mock)
        
        return {
            "symbol": symbol,
            "name": name,
            "price": data["price"],
            "change": data["change"],
            "changePercent": data["changePercent"],
            "time": datetime.now().strftime("%H:%M:%S")
        }
    
    def _get_static_mock_indices(self):
        """Generate static mock data for major indices (fallback)"""
        return [
            self._get_static_mock_data("^GSPC", "S&P 500"),
            self._get_static_mock_data("^DJI", "Dow Jones"),
            self._get_static_mock_data("^IXIC", "NASDAQ"),
            self._get_static_mock_data("^VIX", "VIX"),
            self._get_static_mock_data("^RUT", "Russell 2000")
        ]
    
    def _get_stock_name(self, symbol):
        """Get company name for a symbol"""
        stock_names = {
            "AAPL": "Apple Inc.",
            "MSFT": "Microsoft Corp.",
            "GOOGL": "Alphabet Inc.",
            "AMZN": "Amazon.com Inc.",
            "TSLA": "Tesla Inc.",
            "META": "Meta Platforms Inc.",
            "NVDA": "NVIDIA Corp.",
            "NFLX": "Netflix Inc.",
            "JPM": "JPMorgan Chase & Co.",
            "V": "Visa Inc."
        }
        return stock_names.get(symbol, symbol)

# Create a single instance
market_data_service = MarketDataService()