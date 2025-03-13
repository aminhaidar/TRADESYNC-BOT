import requests
import os
import logging
from dotenv import load_dotenv

# Load environment variables again (in case they weren't passed from app.py)
load_dotenv()

# Configure logger
logger = logging.getLogger(__name__)

# Debug print for environment variables
logger.info("=== ALPACA SERVICE ENV DEBUG ===")
logger.info(f"ALPACA_API_KEY exists: {'ALPACA_API_KEY' in os.environ}")
logger.info(f"ALPACA_SECRET_KEY exists: {'ALPACA_SECRET_KEY' in os.environ}")

# Load Alpaca API Keys from environment variables
ALPACA_API_KEY = os.getenv("ALPACA_API_KEY")
ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")
ALPACA_BASE_URL = "https://paper-api.alpaca.markets"
ALPACA_DATA_URL = "https://data.alpaca.markets"

logger.info(f"ALPACA_API_KEY value: {ALPACA_API_KEY[:4] if ALPACA_API_KEY else 'Not set'}...")
logger.info(f"ALPACA_SECRET_KEY value: {ALPACA_SECRET_KEY[:4] if ALPACA_SECRET_KEY else 'Not set'}...")

HEADERS = {
    "APCA-API-KEY-ID": ALPACA_API_KEY,
    "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
}

logger.info(f"Headers configured with API key ID: {'APCA-API-KEY-ID' in HEADERS}")
logger.info(f"Headers configured with Secret key: {'APCA-API-SECRET-KEY' in HEADERS}")

def fetch_stock_data(symbol):
    """
    Fetch real-time stock data from Alpaca API.
    """
    # Check if API keys are set
    if not ALPACA_API_KEY or not ALPACA_SECRET_KEY:
        logger.error("Alpaca API keys are not set. Returning mock data.")
        # Return mock data for testing if API keys aren't available
        return {
            "symbol": symbol,
            "price": 175.34,
            "bid": 175.30,
            "ask": 175.38,
            "volume": 10234567,
            "change_percent": 1.25,
            "is_mock": True
        }
    
    try:
        logger.info(f"Fetching stock data for {symbol}")
        
        # First try the newer v2 API endpoint for stock snapshots
        url = f"{ALPACA_DATA_URL}/v2/stocks/{symbol}/snapshot"
        
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        logger.info(f"Successfully fetched data for {symbol}")
        
        # Extract data from the snapshot response
        latest_trade = data.get("latestTrade", {})
        latest_quote = data.get("latestQuote", {})
        
        current_price = latest_trade.get("p", 0)
        prev_day_close = data.get("previousDayBar", {}).get("c", current_price)
        change_percent = ((current_price - prev_day_close) / prev_day_close * 100) if prev_day_close else 0
        
        return {
            "symbol": symbol,
            "price": current_price,
            "bid": latest_quote.get("bp", 0),
            "ask": latest_quote.get("ap", 0),
            "volume": latest_trade.get("v", 0),
            "change_percent": round(change_percent, 2),
            "is_mock": False
        }
    except requests.exceptions.RequestException as e:
        logger.warning(f"Error fetching stock data via newer API for {symbol}: {str(e)}")
        
        # Fall back to the older v2 API endpoint for bars
        try:
            logger.info(f"Trying fallback API endpoint for {symbol}")
            url = f"{ALPACA_DATA_URL}/v2/stocks/{symbol}/bars/latest"
            
            response = requests.get(url, headers=HEADERS, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            bar = data.get("bar", {})
            
            return {
                "symbol": symbol,
                "price": bar.get("c", 0),
                "bid": bar.get("l", 0),  # Using low as bid (approximate)
                "ask": bar.get("h", 0),  # Using high as ask (approximate)
                "volume": bar.get("v", 0),
                "change_percent": round(((bar.get("c", 0) - bar.get("o", 0)) / bar.get("o", 0) * 100), 2) if bar.get("o", 0) else 0,
                "is_mock": False
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching stock data via fallback API for {symbol}: {str(e)}")
            
            # Final fallback to mock data
            return {
                "symbol": symbol,
                "price": 175.34,
                "bid": 175.30,
                "ask": 175.38,
                "volume": 10234567,
                "change_percent": 1.25,
                "is_mock": True
            }

def get_alpaca_portfolio():
    """
    Fetch the user's Alpaca portfolio, including account info, positions, and orders.
    """
    # Check if API keys are set
    if not ALPACA_API_KEY or not ALPACA_SECRET_KEY:
        logger.error("Alpaca API keys are not set. Returning mock portfolio data.")
        # Return mock data for testing if API keys aren't available
        return {
            "account": {
                "id": "mock-account-id",
                "account_number": "PA123456789",
                "status": "ACTIVE",
                "currency": "USD",
                "buying_power": "100000.00",
                "regt_buying_power": "100000.00",
                "daytrading_buying_power": "400000.00",
                "cash": "50000.00",
                "portfolio_value": "100000.00",
                "equity": "95000.00",
                "last_equity": "94500.00",
                "initial_margin": "80000.00",
                "maintenance_margin": "60000.00",
                "pattern_day_trader": False,
                "trading_blocked": False,
                "transfers_blocked": False,
                "account_blocked": False,
                "created_at": "2023-01-01T00:00:00Z",
                "shorting_enabled": True,
                "multiplier": "4",
                "long_market_value": "45000.00",
                "short_market_value": "0",
                "is_mock": True
            },
            "positions": [
                {
                    "asset_id": "mock-asset-id-1",
                    "symbol": "AAPL",
                    "exchange": "NASDAQ",
                    "asset_class": "us_equity",
                    "avg_entry_price": "170.25",
                    "qty": "10",
                    "side": "long",
                    "market_value": "1757.50",
                    "cost_basis": "1702.50",
                    "unrealized_pl": "55.00",
                    "unrealized_plpc": "0.0323",
                    "unrealized_intraday_pl": "25.50",
                    "unrealized_intraday_plpc": "0.0147",
                    "current_price": "175.75",
                    "lastday_price": "173.20",
                    "change_today": "0.0147",
                    "is_mock": True
                },
                {
                    "asset_id": "mock-asset-id-2",
                    "symbol": "MSFT",
                    "exchange": "NASDAQ",
                    "asset_class": "us_equity",
                    "avg_entry_price": "295.75",
                    "qty": "5",
                    "side": "long",
                    "market_value": "1526.25",
                    "cost_basis": "1478.75",
                    "unrealized_pl": "47.50",
                    "unrealized_plpc": "0.0321",
                    "unrealized_intraday_pl": "15.25",
                    "unrealized_intraday_plpc": "0.0101",
                    "current_price": "305.25",
                    "lastday_price": "302.20",
                    "change_today": "0.0101",
                    "is_mock": True
                }
            ],
            "recent_orders": [
                {
                    "id": "mock-order-id-1",
                    "client_order_id": "mock-client-order-id-1",
                    "created_at": "2023-03-10T10:30:00Z",
                    "updated_at": "2023-03-10T10:30:01Z",
                    "submitted_at": "2023-03-10T10:30:00Z",
                    "filled_at": "2023-03-10T10:30:01Z",
                    "expired_at": None,
                    "canceled_at": None,
                    "failed_at": None,
                    "asset_id": "mock-asset-id-1",
                    "symbol": "AAPL",
                    "asset_class": "us_equity",
                    "qty": "5",
                    "filled_qty": "5",
                    "type": "market",
                    "side": "buy",
                    "time_in_force": "day",
                    "limit_price": None,
                    "stop_price": None,
                    "filled_avg_price": "170.25",
                    "status": "filled",
                    "extended_hours": False,
                    "legs": None,
                    "is_mock": True
                },
                {
                    "id": "mock-order-id-2",
                    "client_order_id": "mock-client-order-id-2",
                    "created_at": "2023-03-09T11:15:00Z",
                    "updated_at": "2023-03-09T11:15:01Z",
                    "submitted_at": "2023-03-09T11:15:00Z",
                    "filled_at": "2023-03-09T11:15:01Z",
                    "expired_at": None,
                    "canceled_at": None,
                    "failed_at": None,
                    "asset_id": "mock-asset-id-2",
                    "symbol": "MSFT",
                    "asset_class": "us_equity",
                    "qty": "2",
                    "filled_qty": "2",
                    "type": "market",
                    "side": "buy",
                    "time_in_force": "day",
                    "limit_price": None,
                    "stop_price": None,
                    "filled_avg_price": "295.75",
                    "status": "filled",
                    "extended_hours": False,
                    "legs": None,
                    "is_mock": True
                }
            ],
            "is_mock": True
        }
        
    try:
        account_resp = requests.get(f"{ALPACA_BASE_URL}/v2/account", headers=HEADERS, timeout=10)
        account_resp.raise_for_status()
        account_data = account_resp.json()
        
        positions_resp = requests.get(f"{ALPACA_BASE_URL}/v2/positions", headers=HEADERS, timeout=10)
        positions_resp.raise_for_status()
        positions_data = positions_resp.json()
        
        orders_resp = requests.get(f"{ALPACA_BASE_URL}/v2/orders?status=all&limit=10", headers=HEADERS, timeout=10)
        orders_resp.raise_for_status()
        orders_data = orders_resp.json()
        
        # Add is_mock flag to indicate this is real data
        account_data["is_mock"] = False
        
        # Add is_mock flag to each position
        for position in positions_data:
            position["is_mock"] = False
            
        # Add is_mock flag to each order
        for order in orders_data:
            order["is_mock"] = False
        
        return {
            "account": account_data,
            "positions": positions_data,
            "recent_orders": orders_data,
            "is_mock": False
        }
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching Alpaca portfolio: {str(e)}")
        
        # Return mock data as fallback
        return {
            "error": str(e),
            "account": {
                "id": "mock-account-id",
                "account_number": "PA123456789",
                "status": "ACTIVE",
                "currency": "USD",
                "buying_power": "100000.00",
                "regt_buying_power": "100000.00",
                "daytrading_buying_power": "400000.00",
                "cash": "50000.00",
                "portfolio_value": "100000.00",
                "equity": "95000.00",
                "last_equity": "94500.00",
                "initial_margin": "80000.00",
                "maintenance_margin": "60000.00",
                "pattern_day_trader": False,
                "trading_blocked": False,
                "transfers_blocked": False,
                "account_blocked": False,
                "created_at": "2023-01-01T00:00:00Z",
                "shorting_enabled": True,
                "multiplier": "4",
                "long_market_value": "45000.00",
                "short_market_value": "0",
                "is_mock": True
            },
            "positions": [
                {
                    "asset_id": "mock-asset-id-1",
                    "symbol": "AAPL",
                    "exchange": "NASDAQ",
                    "asset_class": "us_equity",
                    "avg_entry_price": "170.25",
                    "qty": "10",
                    "side": "long",
                    "market_value": "1757.50",
                    "cost_basis": "1702.50",
                    "unrealized_pl": "55.00",
                    "unrealized_plpc": "0.0323",
                    "unrealized_intraday_pl": "25.50",
                    "unrealized_intraday_plpc": "0.0147",
                    "current_price": "175.75",
                    "lastday_price": "173.20",
                    "change_today": "0.0147",
                    "is_mock": True
                },
                {
                    "asset_id": "mock-asset-id-2",
                    "symbol": "MSFT",
                    "exchange": "NASDAQ",
                    "asset_class": "us_equity",
                    "avg_entry_price": "295.75",
                    "qty": "5",
                    "side": "long",
                    "market_value": "1526.25",
                    "cost_basis": "1478.75",
                    "unrealized_pl": "47.50",
                    "unrealized_plpc": "0.0321",
                    "unrealized_intraday_pl": "15.25",
                    "unrealized_intraday_plpc": "0.0101",
                    "current_price": "305.25",
                    "lastday_price": "302.20",
                    "change_today": "0.0101",
                    "is_mock": True
                }
            ],
            "recent_orders": [
                {
                    "id": "mock-order-id-1",
                    "client_order_id": "mock-client-order-id-1",
                    "created_at": "2023-03-10T10:30:00Z",
                    "updated_at": "2023-03-10T10:30:01Z",
                    "submitted_at": "2023-03-10T10:30:00Z",
                    "filled_at": "2023-03-10T10:30:01Z",
                    "expired_at": None,
                    "canceled_at": None,
                    "failed_at": None,
                    "asset_id": "mock-asset-id-1",
                    "symbol": "AAPL",
                    "asset_class": "us_equity",
                    "qty": "5",
                    "filled_qty": "5",
                    "type": "market",
                    "side": "buy",
                    "time_in_force": "day",
                    "limit_price": None,
                    "stop_price": None,
                    "filled_avg_price": "170.25",
                    "status": "filled",
                    "extended_hours": False,
                    "legs": None,
                    "is_mock": True
                },
                {
                    "id": "mock-order-id-2",
                    "client_order_id": "mock-client-order-id-2",
                    "created_at": "2023-03-09T11:15:00Z",
                    "updated_at": "2023-03-09T11:15:01Z",
                    "submitted_at": "2023-03-09T11:15:00Z",
                    "filled_at": "2023-03-09T11:15:01Z",
                    "expired_at": None,
                    "canceled_at": None,
                    "failed_at": None,
                    "asset_id": "mock-asset-id-2",
                    "symbol": "MSFT",
                    "asset_class": "us_equity",
                    "qty": "2",
                    "filled_qty": "2",
                    "type": "market",
                    "side": "buy",
                    "time_in_force": "day",
                    "limit_price": None,
                    "stop_price": None,
                    "filled_avg_price": "295.75",
                    "status": "filled",
                    "extended_hours": False,
                    "legs": None,
                    "is_mock": True
                }
            ],
            "is_mock": True
        }