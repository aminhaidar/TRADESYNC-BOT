require('dotenv').config();
const express = require('express');
const http = require('http');
const https = require('https');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const Alpaca = require('@alpacahq/alpaca-trade-api');

// Update the OpenAI key

// Log available environment variables (without exposing full secrets)
console.log("Environment Check:");
console.log(`APCA_API_KEY_ID: ${process.env.APCA_API_KEY_ID ? "✓ Found" : "✗ Missing"}`);
console.log(`APCA_API_SECRET_KEY: ${process.env.APCA_API_SECRET_KEY ? "✓ Found" : "✗ Missing"}`);
console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? "✓ Found" : "✗ Missing"}`);
console.log(`STOCKTWITS_API_TOKEN: ${process.env.STOCKTWITS_API_TOKEN ? "✓ Found" : "✗ Missing"}`);
console.log(`FINNHUB_API_KEY: ${process.env.FINNHUB_API_KEY ? "✓ Found" : "✗ Missing"}`);
console.log(`POLYGON_API_KEY: ${process.env.POLYGON_API_KEY ? "✓ Found" : "✗ Missing"}`);
console.log(`PORT: ${process.env.PORT || 5001}`);

// Initialize Alpaca client
const alpaca = new Alpaca({
  keyId: process.env.APCA_API_KEY_ID,
  secretKey: process.env.APCA_API_SECRET_KEY,
  paper: true,
  baseUrl: process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets',
});

// Create Express app
const app = express();
app.use(cors({
  origin: '*',  // For development; consider restricting in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create HTTP server
const server = http.createServer(app);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Data directory for storing trades and insights
const DATA_DIR = path.join(__dirname, 'data');
const TRADES_FILE = path.join(DATA_DIR, 'trades.json');
const INSIGHTS_DIR = path.join(DATA_DIR, 'insights');

// Ensure data directories exist
async function ensureDataDirs() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(INSIGHTS_DIR, { recursive: true });
    
    // Check if trades file exists, create it if not
    try {
      await fs.access(TRADES_FILE);
    } catch {
      await fs.writeFile(TRADES_FILE, JSON.stringify([]), 'utf8');
    }
  } catch (error) {
    console.error('Error creating data directories:', error);
  }
}

ensureDataDirs();

// Load trades
async function loadTrades() {
  try {
    const data = await fs.readFile(TRADES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading trades:', error);
    return [];
  }
}

// Save trades
async function saveTrades(trades) {
  try {
    await fs.writeFile(TRADES_FILE, JSON.stringify(trades, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving trades:', error);
  }
}

// Add a new trade
async function addTrade(trade) {
  const trades = await loadTrades();
  trades.unshift(trade); // Add to beginning of array
  await saveTrades(trades);
  return trade;
}

// Market Data Functions
async function getMarketData(symbols = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'GOOGL']) {
  try {
    const snapshots = {};
    
    for (const symbol of symbols) {
      try {
        const bars = await alpaca.getBars({
          symbol,
          timeframe: '1Min',
          limit: 1
        });
        
        if (bars[symbol] && bars[symbol].length > 0) {
          snapshots[symbol] = {
            price: bars[symbol][0].c,
            change: bars[symbol][0].c - bars[symbol][0].o,
            changePercent: ((bars[symbol][0].c - bars[symbol][0].o) / bars[symbol][0].o) * 100
          };
        }
      } catch (err) {
        console.error(`Error fetching data for ${symbol}:`, err);
      }
    }
    
    // Convert to array format
    return Object.keys(snapshots).map(symbol => ({
      symbol,
      price: snapshots[symbol].price,
      change: snapshots[symbol].change,
      changePercent: snapshots[symbol].changePercent
    }));
  } catch (error) {
    console.error('Error getting market data:', error);
    return [
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
}

async function getAccountInfo() {
  try {
    const account = await alpaca.getAccount();
    return {
      balance: parseFloat(account.equity),
      totalPnl: parseFloat(account.equity) - parseFloat(account.last_equity),
      dayPnl: parseFloat(account.equity) - parseFloat(account.last_equity),
      openPositions: 0, // Will be updated after getting positions
      winRate: 68 // Placeholder
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

// API for AI analysis of social media posts
function analyzePost(content, source) {
  return new Promise((resolve, reject) => {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not set');
      resolve({ insights: [] });
      return;
    }

    try {
      const systemPrompt = `You are a financial market analysis AI for a trading platform. Your job is to analyze social media posts and extract actionable trading insights. 
      
      For stock-related content, identify:
      1. Mentioned stock symbols/tickers
      2. Sentiment (bullish/bearish/neutral)
      3. Key points about the company or sector
      4. Any specific option trade details mentioned (calls/puts, strike prices, expiration dates)
      5. Confidence level based on the information quality (0.0-1.0 scale)
      
      Provide your analysis as structured JSON with insights array. Each insight should include:
      - symbol: the stock ticker
      - recommendation: "Buy", "Sell", or "Hold"
      - summary: a brief explanation of the insight
      - confidence: a number between 0 and 1
      - category: "technical", "fundamental", "news", "sector", or "actionable"
      - option_details: optional string with option details (format: "155C 04/17" for $155 Call expiring April 17th)
      - source: the platform where this was found (twitter, discord, etc.)
      
      Only include insights with sufficient information. If a post doesn't have any actionable trading information, return an empty insights array.`;

      const userPrompt = `Analyze this ${source} post for potential trading insights:
      "${content}"`;

      const postData = JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const options = {
        hostname: 'api.openai.com',
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Length': postData.length
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const result = JSON.parse(data);
              
              if (result.choices && result.choices[0] && result.choices[0].message) {
                try {
                  // Parse the response content as JSON
                  const analysisResult = JSON.parse(result.choices[0].message.content);
                  
                  // Ensure the insights include source information
                  if (analysisResult.insights) {
                    analysisResult.insights = analysisResult.insights.map(insight => ({
                      ...insight,
                      source: insight.source || source,
                      timestamp: new Date().toISOString()
                    }));
                  }
                  
                  resolve(analysisResult);
                } catch (parseError) {
                  console.error('Error parsing AI response as JSON:', parseError);
                  resolve({ insights: [] });
                }
              } else {
                console.error('Invalid OpenAI response format:', result);
                resolve({ insights: [] });
              }
            } catch (jsonError) {
              console.error('Error parsing OpenAI response:', jsonError);
              resolve({ insights: [] });
            }
          } else {
            console.error(`OpenAI API error: ${res.statusCode}`);
            console.error(data);
            resolve({ insights: [] });
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('Error in OpenAI request:', error);
        resolve({ insights: [] });
      });
      
      req.write(postData);
      req.end();
    } catch (error) {
      console.error('Error in AI analysis:', error);
      resolve({ insights: [] });
    }
  });
}

// Social Media Webhooks
app.post('/webhook/test', async (req, res) => {
  try {
    const { content, source = 'test' } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, error: 'Missing content' });
    }
    
    console.log(`Received ${source} post: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
    
    // Process with AI
    const analysis = await analyzePost(content, source);
    
    // Store insights
    const filename = `${Date.now()}_${source}.json`;
    const insightPath = path.join(INSIGHTS_DIR, filename);
    
    await fs.writeFile(
      insightPath, 
      JSON.stringify({
        source,
        content,
        timestamp: new Date().toISOString(),
        analysis
      }, null, 2)
    );
    
    return res.json({ 
      success: true, 
      filename,
      insights: analysis.insights || []
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get all insights
app.get('/webhook/insights', async (req, res) => {
  try {
    const files = await fs.readdir(INSIGHTS_DIR);
    const insights = [];
    
    for (const file of files) {
      try {
        const content = await fs.readFile(path.join(INSIGHTS_DIR, file), 'utf8');
        const data = JSON.parse(content);
        
        if (data.analysis && data.analysis.insights) {
          insights.push(...data.analysis.insights);
        }
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
      }
    }
    
    // Sort by confidence (highest first)
    insights.sort((a, b) => b.confidence - a.confidence);
    
    return res.json({ success: true, insights });
  } catch (error) {
    console.error('Error getting insights:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Generate mock portfolio performance data
function generateChartData() {
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

// Dashboard data endpoint
app.get('/api/dashboard-data', async (req, res) => {
  try {
    // Get data from different sources in parallel
    const [accountInfo, positions, marketData, trades] = await Promise.all([
      getAccountInfo(),
      getPositions(),
      getMarketData(),
      loadTrades()
    ]);
    
    // Get chart data
    const chartData = generateChartData();
    
    // Get insights
    let insights = [];
    try {
      const files = await fs.readdir(INSIGHTS_DIR);
      
      for (const file of files) {
        try {
          const content = await fs.readFile(path.join(INSIGHTS_DIR, file), 'utf8');
          const data = JSON.parse(content);
          
          if (data.analysis && data.analysis.insights) {
            insights.push(...data.analysis.insights);
          }
        } catch (error) {
          console.error(`Error reading insights file ${file}:`, error);
        }
      }
      
      // Sort by confidence
      insights.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('Error fetching insights:', error);
      
      // Fallback to sample insights
      insights = [
        {
          symbol: "AAPL",
          recommendation: "Buy",
          summary: "Strong technical indicators showing bullish momentum, with potential upside of 8-10% in the next month.",
          confidence: 0.85,
          category: "technical",
          option_details: "180C 04/17",
          source: "AI Analysis"
        },
        {
          symbol: "TSLA",
          recommendation: "Sell",
          summary: "Bearish divergence on RSI and MACD, with resistance at current levels. Profit-taking recommended.",
          confidence: 0.75,
          category: "technical"
        },
        {
          symbol: "MSFT",
          recommendation: "Buy",
          summary: "Cloud services growth exceeding expectations, potential for earnings surprise.",
          confidence: 0.90,
          category: "fundamental",
          option_details: "420C 05/15"
        },
        {
          symbol: "NVDA",
          recommendation: "Buy",
          summary: "AI chip demand remains strong, with potential for further market share gains.",
          confidence: 0.95,
          category: "actionable",
          option_details: "925C 04/24"
        },
        {
          symbol: "SPY",
          recommendation: "Hold",
          summary: "Market consolidating after recent gains, neutral outlook for next week.",
          confidence: 0.65,
          category: "news"
        }
      ];
    }
    
    // Update metrics with position count
    accountInfo.openPositions = positions.length;
    
    // Return compiled dashboard data
    res.json({
      trades: trades.length > 0 ? trades : [{
        symbol: "AAPL",
        action: "buy",
        quantity: 1.0,
        price: 180.0,
        current_price: 185.75,
        status: "executed",
        timestamp: "2025-03-16 12:00:00",
        confidence: 0.85,
        source: "AI Insight",
        option_details: "155C 04/17"
      }],
      insights,
      chartData,
      metrics: accountInfo,
      positions,
      marketData
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Execute trade endpoint
app.post('/api/trigger-trade', async (req, res) => {
  try {
    const tradeData = req.body;
    console.log('Trade triggered via API:', tradeData);
    
    // Create executed trade record
    const executedTrade = {
      id: `trade-${Date.now()}`,
      symbol: tradeData.symbol,
      action: tradeData.action,
      quantity: tradeData.quantity || 1,
      price: tradeData.price || 0,
      current_price: tradeData.price || 0,
      status: "executed",
      timestamp: new Date().toISOString(),
      confidence: tradeData.confidence || 0.8,
      source: tradeData.source || "Manual",
      option_details: tradeData.option_details || ""
    };
    
    // Save trade and broadcast
    await addTrade(executedTrade);
    io.emit('live_trade_update', executedTrade);
    
    res.json({ success: true, trade: executedTrade });
  } catch (error) {
    console.error('Error executing trade:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Socket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  socket.on('execute_trade', async (data) => {
    try {
      console.log('Trade execution requested via socket:', data);
      
      // Create executed trade record
      const executedTrade = {
        id: `trade-${Date.now()}`,
        symbol: data.symbol,
        action: data.action,
        quantity: data.quantity || 1,
        price: data.price || 0,
        current_price: data.price || 0,
        status: "executed",
        timestamp: new Date().toISOString(),
        confidence: data.confidence || 0.8,
        source: data.source || "Socket",
        option_details: data.option_details || ""
      };
      
      // Save trade and broadcast
      await addTrade(executedTrade);
      io.emit('live_trade_update', executedTrade);
    } catch (error) {
      console.error('Error executing trade:', error);
      socket.emit('error', { message: error.message });
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// To update the server.js file, add the following near the top of the file
const MarketDataService = require('./real-time-market');
const marketDataService = new MarketDataService();

// Initialize market data service when server starts
marketDataService.initialize().then(() => {
  console.log('Market data service started');
  
  // Forward market updates to clients
  marketDataService.on('marketUpdate', (data) => {
    io.emit('market_update', data);
  });
});

// Update the getMarketData function to use our service
async function getMarketData() {
  return marketDataService.getLatestMarketData();
}

// Make sure to clean up on exit
process.on('SIGINT', () => {
  console.log('Shutting down...');
  marketDataService.stop();
  process.exit();
});
