import requests
import os
import logging

# Load Alpaca API Keys from environment variables
ALPACA_API_KEY = os.getenv("ALPACA_API_KEY")
ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")
ALPACA_BASE_URL = "https://paper-api.alpaca.markets"

logger = logging.getLogger(__name__)

HEADERS = {
    "APCA-API-KEY-ID": ALPACA_API_KEY,
    "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
}

def fetch_stock_data(symbol):
    """
    Fetch real-time stock data from Alpaca API.
    """
    try:
        url = f"{ALPACA_BASE_URL}/v2/stocks/{symbol}/quotes/latest"
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        data = response.json()

        if "quote" not in data:
            logger.error(f"Invalid response for {symbol}: {data}")
            return {"error": "Invalid data"}

        return {
            "symbol": symbol,
            "price": data["quote"]["ap"],
            "bid": data["quote"]["bp"],
            "ask": data["quote"]["ap"],
            "volume": data["quote"]["bv"],
        }
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching stock data for {symbol}: {str(e)}")
        return {"error": str(e)}

def get_alpaca_portfolio():
    """
    Fetch the user's Alpaca portfolio, including account info, positions, and orders.
    """
    try:
        account_resp = requests.get(f"{ALPACA_BASE_URL}/v2/account", headers=HEADERS, timeout=10)
        account_resp.raise_for_status()
        positions_resp = requests.get(f"{ALPACA_BASE_URL}/v2/positions", headers=HEADERS, timeout=10)
        positions_resp.raise_for_status()
        orders_resp = requests.get(f"{ALPACA_BASE_URL}/v2/orders?status=all&limit=10", headers=HEADERS, timeout=10)
        orders_resp.raise_for_status()

        return {
            "account": account_resp.json(),
            "positions": positions_resp.json(),
            "recent_orders": orders_resp.json(),
        }
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching Alpaca portfolio: {str(e)}")
        return {"error": str(e)}
