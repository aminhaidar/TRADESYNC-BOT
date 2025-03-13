import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3
from fastapi.middleware.cors import CORSMiddleware
from discord_webhook import DiscordWebhook
from datetime import datetime
import discord
import aiohttp
import uvicorn
import certifi
import ssl

# Set global SSL context with certifi certificates
ssl_context = ssl.create_default_context(cafile=certifi.where())

# FastAPI setup
app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
def get_db_connection():
    conn = sqlite3.connect('trades.db')
    conn.row_factory = sqlite3.Row
    return conn

# Trade model
class Trade(BaseModel):
    symbol: str
    action: str
    quantity: int
    timestamp: str

# Initialize database
conn = get_db_connection()
conn.execute('''
CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    action TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    timestamp TEXT NOT NULL
)
''')
conn.close()

# FastAPI Endpoints
@app.get("/trades")
async def get_trades():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, symbol, action, quantity, timestamp FROM trades")
    trades = cursor.fetchall()
    conn.close()
    return [dict(trade) for trade in trades]

@app.post("/trades")
async def add_trade(trade: Trade):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO trades (symbol, action, quantity, timestamp) VALUES (?, ?, ?, ?)",
        (trade.symbol, trade.action, trade.quantity, trade.timestamp)
    )
    conn.commit()
    conn.close()
    return {"message": "Trade added successfully"}

@app.post("/webhook")
async def handle_discord_alert(payload: dict):
    alert_message = payload.get("content", "")
    if not alert_message:
        raise HTTPException(status_code=400, detail="No content in payload")

    try:
        parts = alert_message.split()
        action = parts[0].upper()
        quantity = int(parts[1])
        symbol = parts[2]

        trade = {
            "symbol": symbol,
            "action": action,
            "quantity": quantity,
            "timestamp": datetime.now().isoformat()
        }

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO trades (symbol, action, quantity, timestamp) VALUES (?, ?, ?, ?)",
            (trade["symbol"], trade["action"], trade["quantity"], trade["timestamp"])
        )
        conn.commit()
        conn.close()

        # Send confirmation to your Discord channel
        webhook = DiscordWebhook(url="https://discord.com/api/webhooks/1348477567614582864/dabpsSifkKjoTXAH1axdkoRtGMLinGFeiPy5105u02dLFFHVXsF9c-FvsOmTN_KWio-S", content=f"Trade recorded: {action} {quantity} {symbol}")
        webhook.execute()

        return {"status": "trade recorded"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse alert: {str(e)}")

# Discord Bot Setup with custom HTTP client
class CustomDiscordClient(discord.Client):
    async def start(self, *args, **kwargs):
        self.http.session = aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context))
        await super().start(*args, **kwargs)

intents = discord.Intents.default()
intents.messages = True
intents.message_content = True
bot = CustomDiscordClient(intents=intents)

@bot.event
async def on_ready():
    print(f"Bot logged in as {bot.user}")

@bot.event
async def on_message(message):
    subscribed_channel_id = 1348477267822645331  # Your provided channel ID
    if message.channel.id == subscribed_channel_id and not message.author.bot:
        async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
            payload = {"content": message.content}
            async with session.post("http://127.0.0.1:8000/webhook", json=payload) as resp:
                print(f"Sent alert to backend: {await resp.text()}")

# Run both FastAPI and Discord bot in the same event loop
async def run_server():
    for port in [8000, 8001]:
        config = uvicorn.Config(app, host="127.0.0.1", port=port)
        server = uvicorn.Server(config)
        try:
            await server.serve()
            break
        except OSError as e:
            if "Address already in use" in str(e) and port == 8000:
                print(f"Port {port} is in use, trying {port + 1}...")
                continue
            else:
                raise

async def main():
    # Start the Discord bot and FastAPI server concurrently
    bot_task = bot.start("your_discord_bot_token")  # Replace with your new bot token after resetting
    server_task = run_server()
    await asyncio.gather(bot_task, server_task)

if __name__ == "__main__":
    # Create a new event loop to avoid deprecation warnings
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(main())
    except KeyboardInterrupt:
        loop.run_until_complete(bot.close())
        loop.close()
    finally:
        # Ensure the loop is closed properly
        loop.close()
