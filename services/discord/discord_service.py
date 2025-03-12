import json
from datetime import datetime
from utils.logger import discord_logger as logger
from models.trade import Trade

class DiscordService:
    @staticmethod
    def process_message(data):
        """Process a Discord message and extract trade information"""
        try:
            # Extract the message content
            if 'content' not in data:
                logger.warning("Received Discord data without content field")
                return {"status": "error", "message": "No content field in data"}
            
            message = data['content']
            logger.info(f"Processing Discord message: {message}")
            
            # Log the raw message
            with open('discord_trades.log', 'a') as f:
                log_entry = {
                    'time': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    'message': message
                }
                f.write(json.dumps(log_entry) + '\n')
            
            # Try to parse the message into a Trade object
            trade = Trade.from_discord_message(message)
            
            # If successfully parsed, save the trade
            if trade:
                trade.save()
                logger.info(f"Extracted and saved trade: {trade.symbol} {trade.trade_type}")
                return {
                    "status": "success", 
                    "message": "Trade extracted and saved",
                    "trade": {
                        "symbol": trade.symbol,
                        "price": trade.price,
                        "quantity": trade.quantity,
                        "type": trade.trade_type
                    }
                }
            else:
                logger.warning(f"Could not extract trade from message: {message}")
                return {"status": "warning", "message": "Could not extract trade information"}
                
        except Exception as e:
            logger.error(f"Error processing Discord message: {str(e)}")
            return {"status": "error", "message": str(e)}

discord_service = DiscordService()
