#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting TradeSync Bot updates...${NC}"

# Step 1: Update backend configuration
echo -e "${GREEN}Updating backend configuration...${NC}"

# Create data directories if they don't exist
mkdir -p backend-node/data
mkdir -p backend-node/data/insights

# Create a real-time market data service file
cat > backend-node/real-time-market.js << 'EOL'
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
EOL

# Create a default trades.json file if it doesn't exist
if [ ! -f backend-node/data/trades.json ]; then
  cat > backend-node/data/trades.json << 'EOL'
[
  {
    "id": "trade-1647522000000",
    "symbol": "AAPL",
    "action": "buy",
    "quantity": 1,
    "price": 185.75,
    "current_price": 185.75,
    "option_details": "155C 04/17",
    "timestamp": "2025-03-16T12:00:00.000Z",
    "status": "executed",
    "confidence": 0.85,
    "source": "AI Insight"
  }
]
EOL
fi

# Step 2: Update ModernDashboard.css to ensure proper styling
echo -e "${GREEN}Updating ModernDashboard styling...${NC}"

# Create a basic CSS file if it doesn't exist
cat > frontend/src/components/ModernDashboard.css << 'EOL'
/* Modern Dashboard Styles */
.modern-dashboard {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #0d1117;
  color: #c9d1d9;
}

/* Header styles */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #161b22;
  border-bottom: 1px solid #30363d;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-container h1 {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 700;
}

.logo-accent {
  color: #3fb950;
}

.environment-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background-color: #238636;
  color: white;
  border-radius: 4px;
  margin-left: 0.5rem;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.connected {
  background-color: #3fb950;
}

.status-indicator.disconnected {
  background-color: #f85149;
}

/* Dashboard content */
.dashboard-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar styling */
.dashboard-sidebar {
  width: 300px;
  flex-shrink: 0;
  overflow-y: auto;
  padding: 1rem;
  background-color: #0d1117;
  border-right: 1px solid #30363d;
}

.right-sidebar {
  border-right: none;
  border-left: 1px solid #30363d;
  width: 350px;
}

/* Main content */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

/* Panel styling */
.panel {
  background-color: #161b22;
  border-radius: 6px;
  border: 1px solid #30363d;
  margin-bottom: 1rem;
  padding: 1rem;
}

.panel h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
}

/* Account panel */
.account-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-label {
  font-size: 0.75rem;
  color: #8b949e;
}

.metric-value {
  font-size: 1.125rem;
  font-weight: 600;
}

.metric-value.positive {
  color: #3fb950;
}

.metric-value.negative {
  color: #f85149;
}

/* Market panel */
.market-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.market-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #30363d;
}

.market-item:last-child {
  border-bottom: none;
}

.market-symbol {
  font-weight: 600;
}

.market-price {
  color: #8b949e;
}

.market-change {
  text-align: right;
}

.market-change.positive {
  color: #3fb950;
}

.market-change.negative {
  color: #f85149;
}

/* Positions panel */
.positions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.position-item {
  border-bottom: 1px solid #30363d;
  padding-bottom: 0.75rem;
}

.position-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.position-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.position-symbol {
  font-weight: 600;
}

.position-pnl {
  font-weight: 600;
}

.position-pnl.positive {
  color: #3fb950;
}

.position-pnl.negative {
  color: #f85149;
}

.position-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #8b949e;
}

.position-change.positive {
  color: #3fb950;
}

.position-change.negative {
  color: #f85149;
}

/* Insights panel */
.insights-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.insights-filters {
  display: flex;
  gap: 0.5rem;
}

.filter-select {
  background-color: #0d1117;
  border: 1px solid #30363d;
  color: #c9d1d9;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.insights-content {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.insight-card {
  background-color: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.insight-card.high-conviction {
  border-color: #3fb950;
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.insight-symbol-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.insight-symbol {
  font-weight: 600;
  font-size: 1.125rem;
}

.high-conviction-badge {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  background-color: rgba(63, 185, 80, 0.2);
  color: #3fb950;
  border-radius: 4px;
  display: inline-block;
}

.insight-recommendation {
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-align: center;
}

.insight-recommendation.bullish {
  background-color: rgba(63, 185, 80, 0.2);
  color: #3fb950;
}

.insight-recommendation.bearish {
  background-color: rgba(248, 81, 73, 0.2);
  color: #f85149;
}

.insight-summary {
  font-size: 0.9375rem;
  line-height: 1.5;
  flex: 1;
}

.insight-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.insight-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #8b949e;
}

.insight-confidence,
.insight-option,
.insight-source {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.execute-button {
  background-color: #238636;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.execute-button:hover {
  background-color: #2ea043;
}

.execute-button:disabled {
  background-color: #30363d;
  cursor: not-allowed;
}

/* Chart panel */
.chart-container {
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.performance-chart {
  width: 100%;
  height: auto;
  max-height: 300px;
  border-radius: 4px;
}

/* Trades panel */
.trades-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.trade-item {
  border-bottom: 1px solid #30363d;
  padding-bottom: 0.75rem;
}

.trade-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.trade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.trade-symbol {
  font-weight: 600;
}

.trade-action {
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.trade-action.buy {
  background-color: rgba(63, 185, 80, 0.2);
  color: #3fb950;
}

.trade-action.sell {
  background-color: rgba(248, 81, 73, 0.2);
  color: #f85149;
}

.trade-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.trade-price {
  color: #8b949e;
}

.trade-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  font-size: 0.75rem;
}

.trade-timestamp {
  color: #8b949e;
}

.trade-status {
  font-weight: 600;
  color: #3fb950;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
  color: #8b949e;
  font-style: italic;
}

/* Responsive styles */
@media (max-width: 1280px) {
  .dashboard-content {
    flex-direction: column;
  }
  
  .dashboard-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #30363d;
  }
  
  .right-sidebar {
    border-left: none;
  }
  
  .account-metrics {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .insights-content {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .account-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .insights-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .insights-filters {
    width: 100%;
    justify-content: space-between;
  }
}
EOL

# Step 3: Update the start script
echo -e "${GREEN}Updating the start script...${NC}"

cat > start-modern.sh << 'EOL'
#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting TradeSync Bot with Modern UI...${NC}"

# Kill any existing processes
echo -e "Killing any existing processes..."
pkill -f "node.*server.js" || true
pkill -f "npm start" || true

# Wait for processes to terminate
sleep 2

# Start backend
cd backend-node
echo -e "${GREEN}Starting backend server on port 5001...${NC}"
PORT=5001 APCA_API_KEY_ID="PKJ4SXESMNL2TC496B2J" APCA_API_SECRET_KEY="ehqd4WyctmQzjI7qsNL2lo9fQsu5d3jFUd1UReK4" node server.js &
BACKEND_PID=$!
echo -e "${GREEN}Backend started with PID: ${BACKEND_PID}${NC}"

# Wait for backend to initialize
echo -e "${YELLOW}Waiting for backend to initialize...${NC}"
sleep 3

# Start frontend
cd ../frontend
echo -e "${GREEN}Starting frontend...${NC}"
REACT_APP_BACKEND_URL=http://localhost:5001 PORT=3001 npm start

# If we get here, frontend exited
echo -e "${RED}Frontend process exited. Killing backend...${NC}"
kill $BACKEND_PID || true
EOL

chmod +x start-modern.sh

echo -e "${GREEN}TradeSync Bot updates completed!${NC}"
echo -e "${YELLOW}To start the application, run:${NC}"
echo -e "${GREEN}./start-modern.sh${NC}"
