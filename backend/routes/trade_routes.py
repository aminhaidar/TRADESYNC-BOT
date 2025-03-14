from flask import Blueprint, request, jsonify
import logging
from database import get_db_connection

trade_routes = Blueprint("trade_routes", __name__)
logger = logging.getLogger(__name__)

@trade_routes.route("/trades", methods=["GET"])
def get_trades():
    """
    Fetch recent trades stored in the 'trades' table.
    """
    logger.info("Fetching trades from 'trades' table")
    try:
        conn = get_db_connection()
        logger.info("Database connection established")
        trades = conn.execute("SELECT * FROM trades ORDER BY id DESC LIMIT 20").fetchall()
        conn.close()
        result = [dict(trade) for trade in trades]
        logger.info(f"Returning {len(result)} trades")
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error fetching trades: {str(e)}")
        return jsonify({"error": str(e)}), 500