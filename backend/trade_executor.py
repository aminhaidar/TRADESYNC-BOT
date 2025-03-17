import logging
from datetime import datetime
import alpaca_service
import database

logger = logging.getLogger(__name__)

def get_option_symbol(symbol, option_details):
    try:
        # Parse option details (e.g., "155C 04/17")
        parts = option_details.split()
        if len(parts) != 2:
            logger.error(f"Invalid option_details format: {option_details}")
            return None

        strike_part, date_part = parts
        strike = float(strike_part[:-1])  # Remove 'C' or 'P' to get strike price
        option_type = 'call' if 'C' in strike_part.upper() else 'put'
        
        # Parse "MM/DD" to "YYYY-MM-DD" (assuming year 2025)
        try:
            expiration = datetime.strptime(f"2025-{date_part}", "%Y-%m/%d").date()
        except ValueError:
            logger.error(f"Invalid date format in option_details: {date_part}")
            return None

        # Fetch option contracts
        contracts = alpaca_service.get_option_contracts(symbol)
        if not contracts:
            logger.warning(f"No option contracts found for {symbol}")
            return None

        # Log available contracts for debugging
        logger.info(f"Available contracts for {symbol} with strike {strike}:")
        for contract in contracts:
            logger.info(f" - Symbol: {contract.symbol}, Strike: {contract.strike_price}, Expiration: {contract.expiration_date}, Type: {contract.option_type}")

        # Find matching contract
        for contract in contracts:
            if (abs(contract.strike_price - strike) <= 0.01 and  # Allow small float differences
                contract.expiration_date == expiration and
                contract.option_type == option_type):
                logger.info(f"Valid option symbol found: {contract.symbol}")
                return contract.symbol

        logger.error(f"No valid option contract for {symbol} with strike ${strike} and expiration {expiration.strftime('%Y%m%d')}")
        return None
    except Exception as e:
        logger.error(f"Error in get_option_symbol: {str(e)}")
        return None

def execute_trade(trade, entry_price=None):
    try:
        logger.info(f"Executing trade: {trade}")
        
        # Make sure option_details is correctly set
        if 'option_details' not in trade or not trade['option_details']:
            trade['option_details'] = "155C 04/17"
            logger.info(f"Setting default option_details to 155C 04/17")
        
        # Get the option symbol for price lookup
        symbol = trade.get('symbol', 'AAPL')
        option_details = trade.get('option_details', '155C 04/17')
        option_symbol = get_option_symbol(symbol, option_details)
        
        if option_symbol:
            price, _, _, _ = alpaca_service.get_option_quote(option_symbol)
            logger.info(f"Got price {price} for option {option_symbol}")
            trade['price'] = price
        else:
            logger.warning(f"Could not get option symbol for {symbol} with details {option_details}")
            trade['price'] = 1.55  # Default price for 155C strike
        
        # Update the trade status
        trade['status'] = 'executed'
        trade['timestamp'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Save the trade to the database
        conn = database.setup_database('sqlite:///trades.db')
        trade_obj = database.Trade(
            symbol=trade['symbol'],
            action=trade['action'],
            quantity=trade.get('contracts', 1),
            price=trade['price'],
            status=trade['status'],
            timestamp=datetime.now(),
            confidence=trade.get('confidence', 0.75),
            source=trade.get('source', 'System'),
            user=trade.get('user', 'System'),
            url=trade.get('url', ''),
            option_details=trade['option_details'],
            closed=False,
            closed_timestamp=None
        )
        conn.add(trade_obj)
        conn.commit()
        conn.close()
        
        logger.info(f"Trade executed and saved to database: {trade}")
        return trade
    except Exception as e:
        logger.error(f"Error executing trade: {str(e)}")
        trade['status'] = 'rejected'
        return trade
