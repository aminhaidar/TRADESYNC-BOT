import os
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import GetOptionContractsRequest

load_dotenv()
logger = logging.getLogger(__name__)

def get_alpaca_client():
    key_id = os.getenv("APCA_API_KEY_ID")
    secret_key = os.getenv("APCA_API_SECRET_KEY")
    if not key_id or not secret_key:
        logger.error("Alpaca API credentials not found in environment")
        raise ValueError("APCA_API_KEY_ID and APCA_API_SECRET_KEY must be set")
    try:
        client = TradingClient(
            api_key=key_id,
            secret_key=secret_key,
            paper=True  # Use paper trading
        )
        return client
    except Exception as e:
        logger.error(f"Failed to initialize Alpaca client: {str(e)}")
        raise

alpaca_client = get_alpaca_client()

def get_stock_data(symbol, timestamp):
    try:
        from alpaca.data import StockHistoricalDataClient
        from alpaca.data.requests import StockLatestQuoteRequest
        
        data_client = StockHistoricalDataClient(
            api_key=os.getenv("APCA_API_KEY_ID"),
            secret_key=os.getenv("APCA_API_SECRET_KEY")
        )
        request = StockLatestQuoteRequest(symbol_or_symbols=symbol)
        quote = data_client.get_stock_latest_quote(request)
        quote = quote[symbol]
        logger.info(f"Alpaca get_stock_data response for {symbol}: {quote}")
        return quote.ask_price if quote and quote.ask_price else 0
    except Exception as e:
        logger.error(f"Error fetching stock data for {symbol}: {str(e)}")
        return 0

def get_option_contracts(symbol):
    try:
        # Fetch option contracts using alpaca-py
        expiration_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
        request = GetOptionContractsRequest(
            underlying_symbols=[symbol],
            expiration_date_gte=expiration_date,
            status='active',
            limit=10
        )
        options = alpaca_client.get_option_contracts(request)
        contracts = options.option_contracts if options.option_contracts else []

        class OptionContract:
            def __init__(self, symbol, strike_price, expiration_date, option_type):
                self.symbol = symbol
                self.strike_price = strike_price
                self.expiration_date = expiration_date
                self.option_type = option_type

        option_contracts = []
        for contract in contracts:
            option_contracts.append(OptionContract(
                symbol=contract.symbol,
                strike_price=float(contract.strike_price),
                expiration_date=contract.expiration_date,
                option_type=contract.type.lower()  # Use type as per alpaca-py
            ))
        if not option_contracts:
            logger.warning(f"No option contracts found for {symbol} with expiration >= {expiration_date}")
        return option_contracts
    except Exception as e:
        logger.error(f"Error fetching option contracts for {symbol}: {str(e)}")
        return []

def get_option_quote(option_symbol):
    try:
        if not option_symbol:
            raise ValueError("Option symbol cannot be None")
        from alpaca.data import OptionHistoricalDataClient
        from alpaca.data.requests import OptionLatestQuoteRequest

        data_client = OptionHistoricalDataClient(
            api_key=os.getenv("APCA_API_KEY_ID"),
            secret_key=os.getenv("APCA_API_SECRET_KEY")
        )
        request = OptionLatestQuoteRequest(symbol_or_symbols=option_symbol)
        quote = data_client.get_option_latest_quote(request)
        quote = quote[option_symbol]
        logger.info(f"Alpaca get_option_quote response for {option_symbol}: {quote}")
        last_price = float(quote.last_price) if quote and quote.last_price else 1.80
        bid_price = float(quote.bid_price) if quote and quote.bid_price else 1.75
        ask_price = float(quote.ask_price) if quote and quote.ask_price else 1.85
        spread = ask_price - bid_price
        return last_price, bid_price, ask_price, spread
    except Exception as e:
        logger.error(f"Error fetching quote for {option_symbol}: {str(e)}")
        return 1.80, 1.75, 1.85, 0.10
