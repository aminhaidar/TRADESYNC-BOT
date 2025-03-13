# 🤖 TradeSync Bot

## Overview

TradeSync Bot is a sophisticated web application designed to automate and streamline trading operations, providing real-time market insights and trade execution capabilities.

## 🚀 Features

- **Real-time Market Data**: Track live market indicators (VIX, SPX, IWM, Bitcoin)
- **Automated Trade Execution**: Process trade alerts from Discord
- **Portfolio Management**: Monitor account balance and positions
- **OAuth Authentication**: Secure Google login
- **WebSocket Integration**: Real-time updates and communication

## 📦 Technology Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Python Flask
- **Real-time Communication**: WebSockets
- **Trading Platform**: Alpaca API
- **Authentication**: Google OAuth

## 🛠️ Prerequisites

- Python 3.9+
- Node.js 14+
- npm
- Alpaca Trading Account
- Google OAuth Credentials

## 🔧 Setup and Installation

### 1. Clone the Repository

```bash
git clone https://github.com/aminhaidar/TRADESYNC-BOT.git
cd TRADESYNC-BOT
```

### 2. Backend Setup

#### Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate
```

#### Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in the project root:

```
FLASK_SECRET_KEY=your_secure_random_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
ALPACA_API_KEY=your_alpaca_api_key
ALPACA_SECRET_KEY=your_alpaca_secret_key
```

### 3. Frontend Setup

```bash
cd tradesync-bot-frontend
npm install
```

### 4. Running the Application

#### Development Mode

Backend:
```bash
flask run
```

Frontend:
```bash
npm start
```

#### Production Deployment

```bash
./run.sh
```

## 🔒 Security

- OAuth authentication
- Secure environment variable management
- WebSocket connection security
- API key protection

## 📊 Configuration

Customize application behavior through:
- `.env` file
- `config.py`
- `tailwind.config.js`

## 🧪 Testing

### Backend Tests

```bash
python -m pytest tests/
```

### Frontend Tests

```bash
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

Amin Haidar - [Your Email or LinkedIn]

Project Link: [https://github.com/aminhaidar/TRADESYNC-BOT](https://github.com/aminhaidar/TRADESYNC-BOT)

## 🙏 Acknowledgements

- [React.js](https://reactjs.org/)
- [Flask](https://flask.palletsprojects.com/)
- [Alpaca](https://alpaca.markets/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Disclaimer**: Use this bot responsibly. Trading involves financial risk.