from flask import Blueprint, request, jsonify
import logging
import json
from database import get_db_connection

trade_routes = Blueprint("trade_routes", __name__)
logger = logging.getLogger(__name__)

@trade_routes.route("/trades", methods=["GET"])
def get_trades():
    """
    Fetch recent trades stored in the database.
    """
    try:
        conn = get_db_connection()
        trades = conn.execute("SELECT * FROM alerts ORDER BY id DESC LIMIT 20").fetchall()
        conn.close()
        result = []
        for trade in trades:
            trade_dict = dict(trade)
            try:
                trade_dict["parsed_data"] = json.loads(trade_dict["parsed_data"])
            except json.JSONDecodeError:
                trade_dict["parsed_data"] = {"error": "Failed to parse"}
            result.append(trade_dict)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error fetching trades: {str(e)}")
        return jsonify({"error": str(e)}), 500