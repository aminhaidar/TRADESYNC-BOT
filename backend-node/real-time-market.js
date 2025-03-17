const EventEmitter = require('events');

class MarketDataService extends EventEmitter {
  constructor() {
    super();
    this.isRunning = false;
    this.intervalId = null;
    this.marketData = [
      { symbol: 'SPY', price: 538.72, change: 1.24, changePercent: 0.23 },
      { symbol: 'QQQ', price: 461.35, change: 2.18, changePercent: 0.47 },
      { symbol: 'AAPL', price: 178.45, change: -0.86, changePercent: -0.48 },
      { symbol: 'MSFT', price: 428.80, change: 3.25, changePercent: 0.76 },
      { symbol: 'TSLA', price: 173.60, change: -1.45, changePercent: -0.83 },
      { symbol: 'AMZN', price: 180.35, change: 1.28, changePercent: 0.71 },
      { symbol: 'NVDA', price: 920.14, change: 15.65, changePercent: 1.73 },
      { symbol: 'GOOGL', price: 155.87, change: 0.54, changePercent: 0.35 },
    ];
  }

  async initialize() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Start sending market updates every 3 seconds
    this.intervalId = setInterval(() => {
      this.updateMarketData();
      this.emit('marketUpdate', this.marketData);
    }, 3000);
    
    return true;
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }
  
  updateMarketData() {
    // Update each ticker with a random price change
    this.marketData = this.marketData.map(item => {
      // Random change between -0.5% and +0.5%
      const randomChange = (Math.random() - 0.5) * item.price * 0.01;
      const newPrice = Math.max(0.01, item.price + randomChange).toFixed(2);
      const change = (newPrice - item.price).toFixed(2);
      const changePercent = (change / item.price * 100).toFixed(2);
      
      return {
        ...item,
        price: parseFloat(newPrice),
        change: parseFloat(change),
        changePercent: parseFloat(changePercent)
      };
    });
  }
  
  getLatestMarketData() {
    return this.marketData;
  }
}

module.exports = MarketDataService;
