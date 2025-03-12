import logging
import json
from datetime import datetime

def process_discord_message(data):
    """Process incoming Discord message data"""
    try:
        # Extract relevant information from the Discord message
        if 'content' in data:
            message = data['content']
            
            # Log the message
            with open('discord_trades.log', 'a') as f:
                log_entry = {
                    'time': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    'message': message
                }
                f.write(json.dumps(log_entry) + '\n')
            
            logging.info(f"Processed Discord message: {message}")
            return {"status": "success", "message": message}
        else:
            logging.warning("Received data without content field")
            return {"status": "error", "message": "No content field in data"}
    except Exception as e:
        logging.error(f"Error processing Discord message: {str(e)}")
        raise