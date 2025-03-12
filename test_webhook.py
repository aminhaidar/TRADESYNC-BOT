#!/usr/bin/env python3
import requests
import json
import argparse
import datetime
import sys

def send_test_alert(webhook_url, alert_text=None):
    """Send a test alert to the webhook endpoint."""
    if not alert_text:
        alert_text = "🔥 Sniper just bought 10 contracts AMZN 200C Expiring 3/21 🚀"
    
    payload = {
        "alert": alert_text,
        "time": datetime.datetime.now().isoformat()
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    print(f"\n📤 Sending webhook payload to {webhook_url}:")
    print(f"✉️  {json.dumps(payload, indent=2)}\n")
    
    try:
        response = requests.post(webhook_url, json=payload, headers=headers)
        print(f"📊 Status Code: {response.status_code}")
        
        # Pretty print the response if it's JSON
        try:
            resp_json = response.json()
            print(f"📥 Response:\n{json.dumps(resp_json, indent=2)}")
        except:
            print(f"📥 Response: {response.text}")
        
        if response.status_code == 200:
            print("\n✅ Test alert sent successfully!")
        else:
            print("\n❌ Failed to send test alert!")
    except Exception as e:
        print(f"\n❌ Error sending test alert: {str(e)}")
        return False
    
    return response.status_code == 200

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test the TradeSync Bot webhook")
    parser.add_argument("--url", "-u", 
                       default="https://ae84-2600-1004-a122-402b-d4f8-45d9-8aa6-c421.ngrok-free.app/webhook", 
                       help="Webhook URL")
    parser.add_argument("--alert", "-a", 
                       help="Custom alert text (default: example AMZN alert)")
    parser.add_argument("--examples", "-e", action="store_true",
                       help="Send multiple example alerts")
    
    args = parser.parse_args()
    
    # Send example alerts if requested
    if args.examples:
        examples = [
            "🚨 WindTrader bought 5 contracts SPY 430P Expiring 3/15 💰",
            "⚡ AlphaInvest just sold 20 contracts TSLA 150C Expiring 4/19 📈",
            "🔔 MarketGuru holding 15 contracts AAPL 180C Expiring 5/17 💎",
            "🔥 TechTrader bought 8 contracts NVDA 850C Expiring 3/28 🚀",
            "⚠️ BearHunter sold 10 contracts QQQ 380P Expiring 3/22 📉"
        ]
        
        success_count = 0
        for example in examples:
            print(f"\n{'='*60}")
            print(f"SENDING EXAMPLE: {example}")
            print(f"{'='*60}")
            if send_test_alert(args.url, example):
                success_count += 1
        
        print(f"\n📊 Results: {success_count}/{len(examples)} alerts sent successfully")
        sys.exit(0 if success_count == len(examples) else 1)
    else:
        # Send a single alert
        success = send_test_alert(args.url, args.alert)
        sys.exit(0 if success else 1)