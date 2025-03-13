from flask import Blueprint, request, jsonify
from services.alpaca_service import fetch_stock_data
import logging

stock_routes = Blueprint("stock_routes", __name__)
logger = logging.getLogger(__name__)

@stock_routes.route("/api/stock_data", methods=["GET"])
def get_stock_data():
    """
    Fetch stock data for a given symbol from Alpaca API.
    """
    try:
        symbol = request.args.get("symbol", "AAPL")  # Default to AAPL
        stock_data = fetch_stock_data(symbol)
        return jsonify(stock_data)
    except Exception as e:
        logger.error(f"Error fetching stock data: {str(e)}")
        return jsonify({"error": str(e)}), 500