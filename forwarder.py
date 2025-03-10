import discord
import aiohttp
import asyncio

MY_TOKEN = "your_discord_bot_token"  # Replace with your token
CHANNEL_ID = 1348477267822645331
WEBHOOK_URL = "https://dc8f-2600-1004-a122-402b-e4fc-d0e-35ac-c1a0.ngrok-free.app/webhook"

intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f"Logged in as {client.user}")

@client.event
async def on_message(message):
    if message.channel.id == CHANNEL_ID and not message.author.bot:
        async with aiohttp.ClientSession() as session:
            payload = {"content": message.content}
            async with session.post(WEBHOOK_URL, json=payload) as resp:
                print(f"Forwarded to backend: {await resp.text()}")

asyncio.run(client.start(MY_TOKEN))