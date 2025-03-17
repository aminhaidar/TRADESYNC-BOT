from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv('/Users/amin.haidar/tradesync-bot/backend/.env')

# Debug print for all required keys
print("APCA_API_KEY_ID:", os.getenv('APCA_API_KEY_ID'))
print("APCA_API_SECRET_KEY:", os.getenv('APCA_API_SECRET_KEY'))
print("OPENAI_API_KEY:", os.getenv('OPENAI_API_KEY'))
print("FINNHUB_API_KEY:", os.getenv('FINNHUB_API_KEY'))
print("POLYGON_API_KEY:", os.getenv('POLYGON_API_KEY'))
print("STOCKTWITS_API_TOKEN:", os.getenv('STOCKTWITS_API_TOKEN'))
print("RAPIDAPI_KEY:", os.getenv('RAPIDAPI_KEY'))
