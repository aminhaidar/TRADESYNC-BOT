import pyautogui
import time
import os
from dotenv import load_dotenv

load_dotenv()

# Coordinates of Discord notification area (adjust these after testing)
NOTIFICATION_X = 50  # Top-left corner of notification
NOTIFICATION_Y = 50
NOTIFICATION_WIDTH = 300
NOTIFICATION_HEIGHT = 100

def capture_notification():
    while True:
        # Take a screenshot of the notification area
        screenshot = pyautogui.screenshot(region=(NOTIFICATION_X, NOTIFICATION_Y, NOTIFICATION_WIDTH, NOTIFICATION_HEIGHT))
        # Use OCR to extract text (requires tesseract installed: brew install tesseract on macOS)
        text = pyautogui.screenshot_to_text(screenshot)
        
        if text and "Trade Alert" in text:  # Adjust this keyword based on your notification format
            print(f"Captured: {text}")
            with open('discord_trades.log', 'a') as f:
                f.write(f"{text} [{time.strftime('%Y-%m-%d %H:%M:%S')}]\n")
        
        time.sleep(5)  # Check every 5 seconds

if __name__ == '__main__':
    print("Starting notification scraper... Position Discord to show notifications.")
    time.sleep(5)  # Give you time to open Discord
    capture_notification()