const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Mock data - same as original app
const mockTrades = [
  {
    id: 1,
    symbol: "AAPL",
    action: "buy",
    quantity: 1.0,
    price: 180.0,
    current_price: 185.75,
    status: "executed",
    timestamp: "2025-03-16 12:00:00",
    confidence: 0.85,
    source: "AI Insight",
    user: "System",
    url: "",
    option_details: "155C 04/17"
  }
];

const mockInsights = [
  {symbol: "AAPL", recommendation: "Buy", summary: "Strong upward trend with 85% confidence", confidence: 0.85, category: "technical"},
  {symbol: "MSFT", recommendation: "Buy", summary: "Positive earnings forecast with 90% confidence", confidence: 0.90, category: "fundamental"},
  {symbol: "TSLA", recommendation: "Sell", summary: "Overbought conditions with 75% confidence", confidence: 0.75, category: "technical"},
  {symbol: "AMZN", recommendation: "Hold", summary: "Market uncertainty with 65% confidence", confidence: 0.65, category: "news"},
  {symbol: "GOOGL", recommendation: "Buy", summary: "Breakout pattern with 80% confidence", confidence: 0.80, category: "technical"}
];

const chartData = {
  labels: ["2025-03-09", "2025-03-10", "2025-03-11", "2025-03-12", "2025-03-13"],
  datasets: [
    {label: "TradeSync Portfolio", data: [10562.58, 10634.92, 10689.87, 10742.42, 10798.81], borderColor: "#3fb950", backgroundColor: "rgba(63, 185, 80, 0.2)", tension: 0.4, fill: true},
    {label: "SPY Benchmark", data: [10532.55, 10578.12, 10615.93, 10650.85, 10695.67], borderColor: "#8b949e", backgroundColor: "rgba(139, 148, 158, 0.2)", tension: 0.4, fill: true}
  ]
};

const metrics = {
  accountValue: 10921.45,
  availableCash: 5243.67,
  totalPnl: 375.82,
  openPositions: 3,
  winRate: 72.5
};

const positions = [
  {symbol: "AAPL", quantity: 1, avgPrice: 180.00, currentPrice: 185.75, pnl: 5.75},
  {symbol: "MSFT", quantity: 2, avgPrice: 410.25, currentPrice: 412.50, pnl: 4.50},
  {symbol: "AMZN", quantity: 1, avgPrice: 178.50, currentPrice: 176.80, pnl: -1.70}
];

// API routes
app.get('/api/dashboard-data', (req, res) => {
  console.log('Dashboard data requested');
  res.json({
    trades: mockTrades,
    insights: mockInsights,
    chartData: chartData,
    metrics: metrics,
    positions: positions
  });
});

app.post('/api/trigger-trade', (req, res) => {
  const trade = {
    symbol: "AAPL",
    action: "buy",
    quantity: 1,
    price: 185.75,
    option_details: "155C 04/17",
    timestamp: new Date().toISOString(),
    source: "Manual Trigger",
    status: "pending",
    confidence: 0.85
  };

  io.emit('live_trade_update', trade);
  console.log('Manually triggered trade update:', trade);
  res.json({message: "Trade update triggered", trade: trade});
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.emit('connection_response', {status: 'connected'});

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('execute_trade', (data) => {
    console.log('Received execute_trade event:', data);

    const trade = {
      id: mockTrades.length + 1,
      symbol: data.symbol || "AAPL",
      action: data.action || "buy",
      quantity: data.quantity || 1,
      price: data.price || 185.75,
      current_price: data.price || 185.75,
      option_details: "155C 04/17",
      timestamp: new Date().toISOString(),
      status: "executed",
      confidence: data.confidence || 0.85,
      source: data.source || "TradeSync Bot"
    };

    mockTrades.push(trade);
    io.emit('live_trade_update', trade);
    console.log('Trade executed and broadcast:', trade);
  });
});

// Start server on port 5001
const PORT = 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
