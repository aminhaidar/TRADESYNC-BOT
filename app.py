from flask import Flask, request
import sqlite3
from transformers import pipeline
from webull import webull

app = Flask(__name__)

nlp = pipeline("question-answering", model="distilbert-base-uncased-distilled-squad")

def parse_alert(message):
    context = message.lower()
    ticker = nlp({"question": "What is the ticker symbol?", "context": context})["answer"].strip("#$")
    action = None
    quantity = 1.0
    if "bought" in context or "buying" in context or "roll up" in context:
        action = "BUY"
    elif "sold" in context or "all out" in context or "trimmed" in context or "stc final" in context or "stopped out" in context:
        action = "SELL"
        if "1/2" in context or "50%" in context or "first trim" in context:
            quantity = 0.5
        elif "1/4" in context or "25%" in context:
            quantity = 0.25
        elif "trimmed more" in context:
            quantity = 0.25
        elif "all out but runners" in context:
            quantity = 0.8
    price = nlp({"question": "What is the price?", "context": context})["answer"]
    trade_type = "STOCK"
    strike = None
    option_type = None
    expiry = None
    if "c" in context or "call" in context or "p" in context or "put" in context:
        trade_type = "OPTION"
        strike = nlp({"question": "What is the strike price?", "context": context})["answer"]
        option_type = "CALL" if "c" in context or "call" in context else "PUT"
        expiry = nlp({"question": "What is the expiration date?", "context": context})["answer"]
    return {
        "ticker": ticker,
        "action": action,
        "price": float(price) if price.replace(".", "").isdigit() else None,
        "quantity": quantity,
        "type": trade_type,
        "strike": float(strike) if strike and strike.replace(".", "").isdigit() else None,
        "option_type": option_type,
        "expiry": expiry if expiry else None
    }

wb = webull()
# Credentials will be set via environment variables on Render
# wb.login('your_email', 'your_password', 'sms_code')

def execute_trade(trade_details):
    cash = float(wb.get_account()['cashBalance'])
    if cash < 50:
        return "Insufficient funds"
    if trade_details["type"] == "STOCK":
        wb.place_order(
            stock=trade_details["ticker"],
            action=trade_details["action"],
            orderType='MKT',
            enforce='GTC',
            quant=1 if trade_details["action"] == "BUY" else trade_details["quantity"]
        )
    elif trade_details["type"] == "OPTION":
        options = wb.get_options(trade_details["ticker"])
        contract_id = None
        for option in options:
            if (float(option['strikePrice']) == trade_details["strike"] and 
                option['expirationDate'] == trade_details["expiry"] and 
                option['type'] == trade_details["option_type"]):
                contract_id = option['contractId']
                break
        if contract_id:
            wb.place_order_option(
                stock=trade_details["ticker"],
                action=trade_details["action"],
                orderType='MKT',
                enforce='GTC',
                quant=1 if trade_details["action"] == "BUY" else trade_details["quantity"],
                price=None,
                optionId=contract_id
            )
    return "Trade placed"

@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.json
    trade_details = parse_alert(data["message"])
    if trade_details["action"]:
        result = execute_trade(trade_details)
        conn = sqlite3.connect('trades.db')
        conn.execute('CREATE TABLE IF NOT EXISTS trades (id INTEGER PRIMARY KEY, ticker TEXT, action TEXT, price REAL, quantity REAL, type TEXT, strike REAL, option_type TEXT, expiry TEXT, source TEXT, timestamp TEXT)')
        conn.execute('INSERT INTO trades (ticker, action, price, quantity, type, strike, option_type, expiry, source, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                     (trade_details["ticker"], trade_details["action"], trade_details["price"], trade_details["quantity"],
                      trade_details["type"], trade_details["strike"], trade_details["option_type"], trade_details["expiry"],
                      data["channel"], data["timestamp"]))
        conn.commit()
        conn.close()
    return "OK", 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)