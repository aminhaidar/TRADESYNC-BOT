import React, { useState } from 'react';
import { Theme } from '@carbon/react'; 
import TradeSyncDashboard from './components/TradeSyncDashboard';
import './App.css';

function App() {
  const [marketData] = useState({
    SPY: { symbol: 'SPY', price: 483.48, change: 1.8 },
    QQQ: { symbol: 'QQQ', price: 418.39, change: 2.2 },
    VIX: { symbol: 'VIX', price: 14.71, change: -5.3 },
    AAPL: { symbol: 'AAPL', price: 213.25, change: 0.8 },
    BTC: { symbol: 'BTC', price: 68480, change: 2.5 }
  });
  
  const [positions] = useState([
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
  ]);
  
  const [accountSummary] = useState({
    totalValue: 52490.40,
    availableCash: 37886.99,
    openPL: 509.59,
    closedPL: 774.51
  });
  
  const [connectionStatus] = useState('connected');

  return (
    <Theme theme="g100">
      <div className="App">
        <TradeSyncDashboard 
          marketData={marketData}
          positions={positions}
          accountSummary={accountSummary}
          connectionStatus={connectionStatus}
        />
      </div>
    </Theme>
  );
}

export default App;
