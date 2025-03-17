import sqlite3
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_option_details():
    try:
        conn = sqlite3.connect('trades.db')
        cursor = conn.cursor()
        
        # First, let's check the current data
        cursor.execute("SELECT id, symbol, option_details FROM trades")
        trades = cursor.fetchall()
        logger.info(f"Found {len(trades)} trades in database")
        
        for trade_id, symbol, option_details in trades:
            logger.info(f"Trade ID {trade_id}: {symbol} with option_details '{option_details}'")
        
        # Update all trades to use 155C 04/17 consistently
        cursor.execute("UPDATE trades SET option_details = '155C 04/17' WHERE option_details != '155C 04/17'")
        conn.commit()
        
        # Verify the update
        cursor.execute("SELECT id, symbol, option_details FROM trades")
        updated_trades = cursor.fetchall()
        logger.info("After update:")
        for trade_id, symbol, option_details in updated_trades:
            logger.info(f"Trade ID {trade_id}: {symbol} with option_details '{option_details}'")
        
        conn.close()
        logger.info("Database update completed successfully")
        return True
    except Exception as e:
        logger.error(f"Error updating database: {str(e)}")
        return False

if __name__ == "__main__":
    update_option_details()
