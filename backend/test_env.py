from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv('/Users/amin.haidar/tradesync-bot/backend/.env')

# Debug print
print("APCA_API_KEY_ID:", os.getenv('APCA_API_KEY_ID'))
print("APCA_API_SECRET_KEY:", os.getenv('APCA_API_SECRET_KEY'))
