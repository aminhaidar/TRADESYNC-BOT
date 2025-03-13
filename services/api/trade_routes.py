import json
from flask import Blueprint, jsonify

trade_routes = Blueprint("trade_routes", __name__)

@trade_routes.route("/api/trades", methods=["GET"])
def get_trades():
    """Fetch latest processed trade alerts"""
    try:
        with open("discord_trades.log", "r") as f:
            trades = [json.loads(line.strip()) for line in f.readlines()]
            return jsonify(trades)
    except Exception as e:
        return jsonify({"error": str(e)})
