const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Mock data
const marketData = {
  SPY: { symbol: 'SPY', price: 483.48, change: 1.8 },
  QQQ: { symbol: 'QQQ', price: 418.39, change: 2.2 },
  VIX: { symbol: 'VIX', price: 14.71, change: -5.3 },
  AAPL: { symbol: 'AAPL', price: 213.25, change: 0.8 },
  BTC: { symbol: 'BTC', price: 68480, change: 2.5 }
};

const positions = [
  { 
    id: 1, 
    symbol: 'AAPL', 
    type: 'stock', 
    quantity: 10, 
    entryPrice: 211.80, 
    currentPrice: 213.25, 
    costBasis: 2118.00, 
    plValue: 14.50, 
    plPercent: 0.7, 
    isProfit: true,
    dayChange: 0.8
  },
  { 
    id: 2, 
    symbol: 'TSLA', 
    type: 'stock', 
    quantity: 15, 
    entryPrice: 180.50, 
    currentPrice: 177.82, 
    costBasis: 2707.50, 
    plValue: -40.20, 
    plPercent: -1.5, 
    isProfit: false,
    dayChange: -1.6
  },
  { 
    id: 3, 
    symbol: 'SPY 490C 03/29/25', 
    type: 'option', 
    quantity: 5, 
    entryPrice: 4.30, 
    currentPrice: 4.88, 
    costBasis: 2150.00, 
    plValue: 290.00, 
    plPercent: 13.5, 
    isProfit: true,
    dayChange: 6.2
  }
];

const accountSummary = {
  totalValue: 52490.40,
  availableCash: 37886.99,
  openPL: 509.59,
  closedPL: 774.51
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Handle client requests
  socket.on('getMarketData', () => {
    console.log('Sending market data');
    socket.emit('marketData', marketData);
    
    // Simulate real-time updates
    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      // Update a random symbol every 5 seconds
      const symbols = Object.keys(marketData);
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const currentPrice = marketData[randomSymbol].price;
      
      // Random price change within ±1%
      const change = currentPrice * (Math.random() * 0.02 - 0.01);
      const newPrice = currentPrice + change;
      
      // Update market data
      marketData[randomSymbol] = {
        ...marketData[randomSymbol],
        price: newPrice,
        change: ((newPrice / currentPrice) - 1) * 100
      };
      
      // Emit updated data
      socket.emit('marketData', { [randomSymbol]: marketData[randomSymbol] });
      
      // Stop after 100 updates to prevent memory leaks in testing
      if (counter >= 100) {
        clearInterval(interval);
      }
    }, 5000);
    
    socket.on('disconnect', () => {
      clearInterval(interval);
    });
  });
  
  socket.on('getPositions', () => {
    console.log('Sending positions');
    socket.emit('positions', positions);
  });
  
  socket.on('getAccountSummary', () => {
    console.log('Sending account summary');
    socket.emit('accountSummary', accountSummary);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
