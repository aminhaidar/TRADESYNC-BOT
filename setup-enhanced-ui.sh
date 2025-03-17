#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Applying Enhanced UI for TradeSync Bot...${NC}"

# Create directories if needed
mkdir -p frontend/src/components
mkdir -p frontend/src/context

# Step 1: Create the Enhanced ModernDashboard component
echo -e "${GREEN}Creating EnhancedModernDashboard component...${NC}"
cat > frontend/src/components/EnhancedModernDashboard.js << 'EOF'
import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import EnhancedAIInsights from './EnhancedAIInsights';
import './ModernDashboard.css';

const EnhancedModernDashboard = ({ dashboardData, refreshData }) => {
  const { isConnected, executeTrade } = useSocket();
  const [marketData, setMarketData] = useState([]);
  const [activeTimeRange, setActiveTimeRange] = useState('week');
  const [isPaperTrading, setIsPaperTrading] = useState(true);

  useEffect(() => {
    if (dashboardData?.marketData) {
      setMarketData(dashboardData.marketData);
    }
  }, [dashboardData]);

  useEffect(() => {
    const socket = window.socket;
    if (socket) {
      socket.on('market_update', (data) => setMarketData(data));
      return () => socket.off('market_update');
    }
  }, []);

  const handleRefresh = () => {
    console.log('Manual refresh requested');
    refreshData();
  };

  return (
    <div className="app-container dark-theme">
      <header className="app-header">
        <div className="logo">
          <h1>Trade<span className="accent">Sync</span> <span className="version-tag">v2.0</span></h1>
        </div>
        <div className="market-tickers">
          {marketData.slice(0, 3).map((ticker, index) => (
            <div className="ticker" key={index}>
              <span className="ticker-name">{ticker.symbol}</span>
              <span className="ticker-value">${ticker.price?.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="header-controls">
          <div className="trading-mode-toggle">
            <label className="switch-toggle">
              <input 
                type="checkbox" 
                checked={!isPaperTrading} 
                onChange={() => setIsPaperTrading(!isPaperTrading)} 
              />
              <span className="slider">
                <span className="paper-label">PAPER</span>
                <span className="live-label">LIVE</span>
              </span>
            </label>
          </div>
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </header>
      <EnhancedAIInsights insights={dashboardData?.insights || []} />
      <button className="refresh-btn" onClick={handleRefresh}>Refresh</button>
    </div>
  );
};

export default EnhancedModernDashboard;
EOF

# Step 2: Create the EnhancedAIInsights component
echo -e "${GREEN}Creating EnhancedAIInsights component...${NC}"
cat > frontend/src/components/EnhancedAIInsights.js << 'EOF'
import React from 'react';
import './EnhancedAIInsights.css';

const EnhancedAIInsights = ({ insights = [] }) => {
  return (
    <div className="ai-insights-card">
      <h2>AI Insights & Trade Opportunities</h2>
      {insights.length > 0 ? (
        insights.map((insight, index) => (
          <div key={index} className="insight-card">
            <div className="insight-header">
              <span className="insight-symbol">{insight.symbol}</span>
              <span className="insight-type">{insight.category || 'Technical'}</span>
            </div>
            <div className="insight-content">{insight.summary}</div>
          </div>
        ))
      ) : (
        <div>No insights available</div>
      )}
    </div>
  );
};

export default EnhancedAIInsights;
EOF

# Step 3: Create the CSS files
echo -e "${GREEN}Creating CSS files...${NC}"
cat > frontend/src/components/ModernDashboard.css << 'EOF'
/* Modern Dashboard Styles */
:root {
  --bg-color: #0d1117;
  --text-primary: #e6edf3;
  --accent-green: #3fb950;
}

.app-container {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-primary);
}

.app-header {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background-color: #161b22;
}

.accent {
  color: var(--accent-green);
}
EOF

cat > frontend/src/components/EnhancedAIInsights.css << 'EOF'
/* AI Insights Styles */
.ai-insights-card {
  background-color: #161b22;
  padding: 1rem;
  border-radius: 8px;
}

.insight-card {
  background-color: #1c2129;
  padding: 0.75rem;
  border-left: 3px solid #3fb950;
  margin-bottom: 0.5rem;
}
EOF

# Step 4: Update App.js to use EnhancedModernDashboard
echo -e "${GREEN}Updating App.js...${NC}"
cat > frontend/src/App.js << 'EOF'
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EnhancedModernDashboard from './components/EnhancedModernDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EnhancedModernDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
EOF

# Step 5: Create a startup script
echo -e "${GREEN}Creating start-enhanced-ui.sh...${NC}"
cat > start-enhanced-ui.sh << 'EOF'
#!/bin/bash

echo -e "Starting TradeSync Bot with Enhanced UI..."

# Kill any existing processes
pkill -f "node.*server.js" || true
pkill -f "npm start" || true
sleep 2

# Start backend
cd backend-node
echo -e "Starting backend server..."
PORT=5001 node server.js &

# Wait for backend to initialize
sleep 3

# Start frontend
cd ../frontend
echo -e "Starting frontend..."
npm start

EOF

chmod +x start-enhanced-ui.sh

echo -e "${GREEN}Setup completed! Run the following command to start:${NC}"
echo -e "${GREEN}./start-enhanced-ui.sh${NC}"
