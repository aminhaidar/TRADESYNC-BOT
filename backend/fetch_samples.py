import logging
import requests
from dotenv import load_dotenv
import os

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("logs/fetch_samples.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)

load_dotenv()
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL")

def fetch_discord_alerts():
    """
    Fetch trade alerts from Discord via webhook (simulated for now).
    """
    try:
        logger.info("Attempting to fetch Discord alerts")
        if not DISCORD_WEBHOOK_URL:
            logger.warning("DISCORD_WEBHOOK_URL not configured. Returning mock alert.")
            return "BUY AAPL 1 CALLS EXP 2025-03-20 @ $2.50"  # Reduced to 1 contract
        response = requests.get(DISCORD_WEBHOOK_URL)
        response.raise_for_status()
        logger.info(f"Discord webhook response: {response.text}")
        return response.text or "BUY AAPL 1 CALLS EXP 2025-03-20 @ $2.50"
    except Exception as e:
        logger.error(f"Error fetching Discord alerts: {str(e)}")
        return None

def parse_trade_alert(message):
    """
    Parse trade alert into structured data (simulated for now).
    """
    try:
        logger.info(f"Parsing alert: {message}")
        parts = message.split()
        if len(parts) < 4:
            return None
        return {
            "symbol": parts[1],
            "action": parts[0],
            "contracts": parts[2],
            "price": float(parts[-1].replace("$", "")) if "$" in parts[-1] else 0.0
        }
    except Exception as e:
        logger.error(f"Error parsing trade alert: {str(e)}")
        return None

if __name__ == "__main__":
    alert = fetch_discord_alerts()
    if alert:
        parsed = parse_trade_alert(alert)
        print(parsed)