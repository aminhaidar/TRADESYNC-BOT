import json
import requests
from datetime import datetime
from services.market_data import MarketDataService

market_data = MarketDataService()

def process_discord_message(data):
    """Process incoming Discord trade alerts"""
    try:
        if "content" in data:
            message = data["content"]
            author_id = data.get("author_id", "Unknown")

            parsed_data = {
                "author": f"Trader {author_id[-4:]}",  # Replace ID with a placeholder name
                "timestamp": datetime.now().isoformat(),
                "summary": message,
                "price_at_alert": None,
                "percent_change": None
            }

            # Extract ticker symbol (basic parsing)
            words = message.split()
            ticker = next((word for word in words if word.isupper() and len(word) < 5), None)

            if ticker:
                stock_data = market_data.get_quote(ticker)
                if "price" in stock_data:
                    parsed_data["price_at_alert"] = stock_data["price"]
                    parsed_data["percent_change"] = "Pending"

            # Save trade alert to log
            with open("discord_trades.log", "a") as f:
                f.write(json.dumps(parsed_data) + "\n")

            return {"status": "success", "data": parsed_data}
        else:
            return {"status": "error", "message": "No content field in data"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
