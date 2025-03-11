from dotenv import load_dotenv
import os
from alpaca_trade_api.rest import REST

# Load environment variables from ***REMOVED*** file
load_dotenv()

# Retrieve API keys
API_KEY = os.getenv("ALPACA_API_KEY")
SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")

if not API_KEY or not SECRET_KEY:
    print("API keys not set correctly in ***REMOVED*** file")
    exit(1)

# Initialize REST client for paper trading
api = REST(
    key_id=API_KEY,
    secret_key=SECRET_KEY,
    base_url="https://paper-api.alpaca.markets",
    api_version="v2"
)

try:
    # Get account information
    account = api.get_account()
    print(f"Successfully connected to Alpaca account: {account.account_number}")
    print(f"Account status: {account.status}")
    print(f"Cash: {account.cash}")
except Exception as e:
    print(f"Failed to connect to Alpaca: {e}")