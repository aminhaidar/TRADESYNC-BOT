const Alpaca = require('@alpacahq/alpaca-trade-api');
const fetch = require('node-fetch');

// Initialize Alpaca client
const alpaca = new Alpaca({
  keyId: process.env.APCA_API_KEY_ID || '',
  secretKey: process.env.APCA_API_SECRET_KEY || '',
  paper: true, // Using paper trading for now
  baseUrl: 'https://paper-api.alpaca.markets',
});

// Default market data if API fails
const DEFAULT_MARKET_DATA = [
  { symbol: 'SPY', price: 538.72, change: 1.24, changePercent: 0.23 },
  { symbol: 'QQQ', price: 461.35, change: 2.18, changePercent: 0.47 },
  { symbol: 'AAPL', price: 178.45, change: -0.86, changePercent: -0.48 },
  { symbol: 'MSFT', price: 428.80, change: 3.25, changePercent: 0.76 },
  { symbol: 'TSLA', price: 173.60, change: -1.45, changePercent: -0.83 },
  { symbol: 'AMZN', price: 180.35, change: 1.28, changePercent: 0.71 },
  { symbol: 'NVDA', price: 920.14, change: 15.65, changePercent: 1.73 },
  { symbol: 'GOOGL', price: 155.87, change: 0.54, changePercent: 0.35 },
];

/**
 * Get account information from Alpaca
 */
async function getAccountInfo() {
  try {
    const account = await alpaca.getAccount();
    return {
      balance: parseFloat(account.equity),
      totalPnl: parseFloat(account.equity) - parseFloat(account.last_equity),
      dayPnl: parseFloat(account.equity) - parseFloat(account.last_equity),
      openPositions: 0, // Will be updated after getting positions
      winRate: 68 // Placeholder - would need trading history to calculate
    };
  } catch (error) {
    console.error('Error getting account info:', error);
    return {
      balance: 25000,
      totalPnl: 1500,
      dayPnl: 250,
      openPositions: 3,
      winRate: 68
    };
  }
}

/**
 * Get current positions from Alpaca
 */
async function getPositions() {
  try {
    const positions = await alpaca.getPositions();
    return positions.map(position => ({
      symbol: position.symbol,
      quantity: parseFloat(position.qty),
      averagePrice: parseFloat(position.avg_entry_price),
      currentPrice: parseFloat(position.current_price),
      pnl: parseFloat(position.unrealized_pl),
      changePercent: parseFloat(position.unrealized_plpc) * 100
    }));
  } catch (error) {
    console.error('Error getting positions:', error);
    return [
      { symbol: 'AAPL', quantity: 10, averagePrice: 175.50, currentPrice: 185.75, pnl: 102.50, changePercent: 5.84 },
      { symbol: 'MSFT', quantity: 5, averagePrice: 350.25, currentPrice: 370.00, pnl: 98.75, changePercent: 5.64 },
      { symbol: 'TSLA', quantity: 8, averagePrice: 180.10, currentPrice: 173.60, pnl: -52.00, changePercent: -3.61 }
    ];
  }
}

/**
 * Get the latest market data for the specified symbols
 */
async function getMarketData(symbols = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'GOOGL']) {
  try {
    // Get previous day's prices for change calculation
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().split('T')[0];
    
    // Fetch current data
    const snapshots = await alpaca.getBars({
      symbols,
      timeframe: '1Min',
      limit: 1
    });
    
    // Process the data
    const marketData = [];
    for (const symbol of symbols) {
      try {
        const bars = snapshots[symbol];
        if (!bars || bars.length === 0) continue;
        
        const currentBar = bars[0];
        const currentPrice = currentBar.c;
        
        // Fetch previous close
        const prevBars = await alpaca.getBars({
          symbol,
          timeframe: '1Day',
          start: yesterdayISO,
          limit: 1
        });
        
        const prevClose = prevBars[symbol] && prevBars[symbol].length > 0 
          ? prevBars[symbol][0].c 
          : currentPrice;
        
        const change = currentPrice - prevClose;
        const changePercent = (change / prevClose) * 100;
        
        marketData.push({
          symbol,
          price: currentPrice,
          change: change,
          changePercent: changePercent
        });
      } catch (symbolError) {
        console.error(`Error fetching data for ${symbol}:`, symbolError);
      }
    }
    
    return marketData.length > 0 ? marketData : DEFAULT_MARKET_DATA;
  } catch (error) {
    console.error('Error getting market data:', error);
    return DEFAULT_MARKET_DATA;
  }
}

/**
 * Get option price for a specific symbol and option details
 * 
 * @param {string} symbol - Stock symbol (e.g., 'AAPL')
 * @param {string} optionDetails - Option details in format like '155C 04/17'
 * @returns {Promise<number>} - Option price
 */
async function getOptionPrice(symbol, optionDetails) {
  try {
    // Parse option details
    const match = optionDetails.match(/(\d+)(C|P)\s+(\d+)\/(\d+)/);
    if (!match) {
      console.error(`Invalid option details format: ${optionDetails}`);
      return 1.0; // Default price
    }
    
    const [_, strikePrice, optionType, month, day] = match;
    const currentYear = new Date().getFullYear();
    const expirationDate = `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const isCall = optionType === 'C';
    
    // For now, use a simple approximation as Alpaca's free tier doesn't support options data
    // In a real implementation, you would use a market data provider that offers options data
    
    // Get current stock price
    const bars = await alpaca.getBars({
      symbol,
      timeframe: '1Min',
      limit: 1
    });
    
    if (!bars[symbol] || bars[symbol].length === 0) {
      return 1.5; // Default fallback
    }
    
    const currentPrice = bars[symbol][0].c;
    const strikeNum = parseFloat(strikePrice);
    
    // Extremely simplified option pricing - not for real trading!
    if (isCall) {
      if (currentPrice > strikeNum) {
        // In the money call
        return parseFloat((currentPrice - strikeNum + 2).toFixed(2));
      } else {
        // Out of the money call
        return parseFloat((2 * Math.exp(-0.1 * (strikeNum - currentPrice) / currentPrice)).toFixed(2));
      }
    } else {
      if (currentPrice < strikeNum) {
        // In the money put
        return parseFloat((strikeNum - currentPrice + 2).toFixed(2));
      } else {
        // Out of the money put
        return parseFloat((2 * Math.exp(-0.1 * (currentPrice - strikeNum) / currentPrice)).toFixed(2));
      }
    }
  } catch (error) {
    console.error(`Error calculating option price for ${symbol} ${optionDetails}:`, error);
    return 1.5; // Default fallback price
  }
}

/**
 * Execute a trade through Alpaca
 */
async function executeTrade(tradeData) {
  try {
    const { symbol, action, quantity, price, option_details } = tradeData;
    
    // If this is an options trade, we'll simulate it (Alpaca paper doesn't support options)
    if (option_details) {
      console.log(`Simulating options trade: ${symbol} ${option_details} ${action} ${quantity}`);
      
      const optionPrice = await getOptionPrice(symbol, option_details);
      
      // Return simulated trade result
      return {
        id: `sim-${Date.now()}`,
        symbol,
        action,
        quantity,
        price: optionPrice,
        status: 'executed',
        timestamp: new Date().toISOString(),
        option_details,
        ...tradeData
      };
    }
    
    // For stock trades, use Alpaca API
    const side = action.toLowerCase() === 'buy' ? 'buy' : 'sell';
    const order = await alpaca.createOrder({
      symbol,
      qty: quantity,
      side,
      type: 'market',
      time_in_force: 'day'
    });
    
    console.log(`Order placed: ${JSON.stringify(order)}`);
    
    return {
      id: order.id,
      symbol,
      action,
      quantity,
      price: price || 0,
      status: order.status,
      timestamp: order.created_at,
      ...tradeData
    };
  } catch (error) {
    console.error('Error executing trade:', error);
    throw error;
  }
}

/**
 * Get historical portfolio performance data
 */
async function getHistoricalPerformance() {
  try {
    // Calculate dates for the last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    // Format dates for Alpaca API
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Fetch portfolio history
    const history = await alpaca.getPortfolioHistory({
      date_start: startDateStr,
      date_end: endDateStr,
      timeframe: '1D',
    });
    
    if (!history || !history.timestamp || history.timestamp.length === 0) {
      return generateMockChartData();
    }
    
    // Format data for Chart.js
    const labels = history.timestamp.map(timestamp => {
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const data = {
      labels,
      datasets: [
        {
          label: 'Portfolio Value',
          data: history.equity,
          borderColor: '#388bfd',
          backgroundColor: 'rgba(56, 139, 253, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
    
    return data;
  } catch (error) {
    console.error('Error getting portfolio history:', error);
    return generateMockChartData();
  }
}

/**
 * Generate mock chart data when API fails
 */
function generateMockChartData() {
  const labels = [];
  const data = [];
  
  // Generate last 30 days
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  
  // Initial value
  let value = 25000;
  for (let i = 0; i < 30; i++) {
    // Random daily change between -2% and +2%
    const change = (Math.random() * 4 - 2) / 100; 
    value = value * (1 + change);
    data.push(Math.round(value * 100) / 100);
  }
  
  return {
    labels,
    datasets: [
      {
        label: 'Portfolio Value',
        data,
        borderColor: '#388bfd',
        backgroundColor: 'rgba(56, 139, 253, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };
}

module.exports = {
  getAccountInfo,
  getPositions,
  getMarketData,
  executeTrade,
  getHistoricalPerformance,
  getOptionPrice
};
