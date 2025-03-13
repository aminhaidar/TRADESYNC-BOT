from flask import Blueprint, jsonify
from services.market_data import MarketDataService

stock_routes = Blueprint("stock_routes", __name__)
market_data = MarketDataService()

@stock_routes.route("/api/stock_data", methods=["GET"])
def get_stock_data():
    """Fetch default stock data for dashboard"""
    try:
        stock_data = market_data.get_quote("SPY")  # Default to SPY for now
        return jsonify(stock_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
