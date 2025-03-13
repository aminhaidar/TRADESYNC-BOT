from flask import Blueprint, jsonify, request
import os
import requests

stock_routes = Blueprint("stock_routes", __name__)

# Load API keys from environment variables
ALPACA_API_KEY = os.getenv("ALPACA_API_KEY")
ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")
ALPACA_BASE_URL = "https://data.alpaca.markets/v2/stocks"

# Function to fetch stock data from Alpaca
def get_stock_data(symbol):
    headers = {
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY
    }

    url = f"{ALPACA_BASE_URL}/quotes/{symbol}"

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

@stock_routes.route("/api/stock_data", methods=["GET"])
def fetch_stock_data():
    symbol = request.args.get("symbol", "AAPL")  # Default to AAPL if no symbol is provided
    stock_data = get_stock_data(symbol)

    if "error" in stock_data:
        return jsonify({"error": stock_data["error"]}), 500

    return jsonify(stock_data)
