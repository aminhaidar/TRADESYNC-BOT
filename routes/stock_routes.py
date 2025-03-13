from flask import Blueprint, jsonify, request
from services.alpaca_service import fetch_stock_data
import logging

stock_routes = Blueprint('stock_routes', __name__)
logger = logging.getLogger(__name__)

@stock_routes.route('/api/stocks', methods=['GET'])
def get_stock_data():
    """
    Fetch stock data for a given symbol
    """
    try:
        symbol = request.args.get('symbol', 'AAPL')
        stock_data = fetch_stock_data(symbol)
        return jsonify(stock_data)
    except Exception as e:
        logger.error(f"Error in stock data route: {str(e)}")
        return jsonify({'error': 'Could not fetch stock data'}), 500