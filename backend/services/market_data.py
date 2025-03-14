import requests

class MarketDataService:
    def __init__(self):
        self.api_url = "https://query1.finance.yahoo.com/v8/finance/chart"

    def get_quote(self, symbol):
        """Fetch stock price from Yahoo Finance"""
        try:
            url = f"{self.api_url}/{symbol}?interval=1d&range=1mo"
            headers = {"User-Agent": "Mozilla/5.0"}
            response = requests.get(url, headers=headers)

            if response.status_code == 200:
                data = response.json()
                price = data["chart"]["result"][0]["meta"]["regularMarketPrice"]
                return {"symbol": symbol, "price": price}
            else:
                return {"error": f"Failed to fetch stock data (Status: {response.status_code})"}
        except Exception as e:
            return {"error": str(e)}

market_data_service = MarketDataService()
