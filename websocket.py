from flask_socketio import SocketIO, emit
import logging

socketio = SocketIO(cors_allowed_origins="*")
logger = logging.getLogger(__name__)

@socketio.on("connect")
def handle_connect():
    logger.info("Client connected")
    emit("status", {"status": "connected"})

@socketio.on("disconnect")
def handle_disconnect():
    logger.info("Client disconnected")

@socketio.on("refresh_data")
def handle_refresh():
    from services.alpaca_service import fetch_stock_data

    logger.info("Client requested data refresh")
    try:
        indices = {
            "SPY": fetch_stock_data("SPY"),
            "QQQ": fetch_stock_data("QQQ"),
            "DIA": fetch_stock_data("DIA"),
            "IWM": fetch_stock_data("IWM"),
            "VIX": fetch_stock_data("VIX"),
        }
        emit("indices_update", indices)
    except Exception as e:
        logger.error(f"Error refreshing data: {str(e)}")
        emit("error", {"message": f"Error refreshing data: {str(e)}"})
