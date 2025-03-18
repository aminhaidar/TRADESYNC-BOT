import React, { useEffect, useState } from 'react';
import './TradeSyncDashboard.css';
import { useSocket } from '../context/SocketContext';
import AIInsights from './insights/AIInsights';
import OpenPositions from './OpenPositions';

// Sidebar Component
const Sidebar = () => (
  <div className="sidebar">
    <div className="logo">
      <span className="logo-circle"></span>
      <span className="logo-text">Trade<span className="logo-highlight">Sync</span></span>
    </div>
    <nav>
      <div className="nav-item active">Dashboard</div>
      <div className="nav-item">AI Insights</div>
      <div className="nav-item">Portfolio</div>
      <div className="nav-item">Performance</div>
      <div className="nav-item">Settings</div>
    </nav>
    <div className="user-card">
      <div className="user-avatar">JP</div>
      <div>
        <div className="user-name">John Parker</div>
        <div className="user-role">Bot Builder</div>
      </div>
    </div>
  </div>
);

// MarketOverview Component
const MarketOverview = ({ marketData }) => (
  <div className="market-overview">
    {['SPY', 'QQQ', 'VIX', 'AAPL', 'BTC'].map((symbol) => {
      const data = marketData[symbol] || { price: 0, change: 0 };
      return (
        <div key={symbol} className="market-card">
          <span className="symbol">{symbol}</span>
          <span className="price">
            ${data.price ? (symbol === 'BTC' ? Math.round(data.price).toLocaleString() : data.price.toFixed(2)) : 'Loading...'}
          </span>
          <span className={`change ${data.change > 0 ? 'positive' : data.change < 0 ? 'negative' : ''}`}>
            {data.change ? `${data.change > 0 ? '+' : ''}${data.change.toFixed(1)}%` : '0.0%'}
          </span>
        </div>
      );
    })}
    <button className="view-all">View All Markets</button>
  </div>
);

// AccountSummary Component
const AccountSummary = ({ accountSummary, performanceData }) => {
  const performanceChange = performanceData && performanceData.values && performanceData.values.length > 1 
    ? ((performanceData.values[performanceData.values.length-1] / performanceData.values[0] - 1) * 100).toFixed(2)
    : 2.45;
  
  const isPositive = parseFloat(performanceChange) >= 0;
  
  return (
    <div className="account-summary">
      <h2>Account Summary</h2>
      <div className="total-value">
        ${accountSummary.totalValue ? accountSummary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Loading...'}
      </div>
      <div className="metric-card">
        <span>Available Cash</span>
        <span>${accountSummary.availableCash ? accountSummary.availableCash.toLocaleString() : 'Loading...'}</span>
      </div>
      <div className="metric-row">
        <div className="metric-card half">
          <span>Open P/L</span>
          <span className={accountSummary.openPL >= 0 ? 'positive' : 'negative'}>
            {accountSummary.openPL >= 0 ? '+' : ''}${accountSummary.openPL ? accountSummary.openPL.toLocaleString() : '0'}
          </span>
        </div>
        <div className="metric-card half">
          <span>Closed P/L</span>
          <span className={accountSummary.closedPL >= 0 ? 'positive' : 'negative'}>
            {accountSummary.closedPL >= 0 ? '+' : ''}${accountSummary.closedPL ? accountSummary.closedPL.toLocaleString() : '0'}
          </span>
        </div>
      </div>
      <div className="performance-section">
        <h3>Performance</h3>
        <div className="tabs">
          <span className="tab active">1D</span>
          <span className="tab">1W</span>
          <span className="tab">1M</span>
          <span className="tab">3M</span>
          <span className="tab">1Y</span>
        </div>
        <div className="chart-placeholder">
          <div className="chart-path"></div>
        </div>
      </div>
    </div>
  );
};

// TradingStats Component
const TradingStats = () => (
  <div className="trading-stats">
    <h2>Trading Stats</h2>
    <div className="stat-card">
      <span>Win Rate</span>
      <span>78% (21/27)</span>
    </div>
    <div className="stat-card">
      <span>Average Gain</span>
      <span className="positive">+14.2%</span>
    </div>
    <div className="stat-card">
      <span>Average Loss</span>
      <span className="negative">-8.6%</span>
    </div>
    <div className="top-performers">
      <h3>Top Performers</h3>
      <div className="performer">
        <div className="performer-avatar green">SN</div>
        <div className="performer-info">
          <span className="performer-name">@ripster47</span>
          <span className="performer-stat">80% win rate</span>
        </div>
      </div>
      <div className="performer">
        <div className="performer-avatar blue">IH</div>
        <div className="performer-info">
          <span className="performer-name">@IronHawk</span>
          <span className="performer-stat">75% win rate</span>
        </div>
      </div>
    </div>
  </div>
);

// Connection Status Component
const ConnectionStatus = ({ status }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    if (status === 'connected') {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(true);
    }
  }, [status]);
  
  if (!visible) return null;
  
  return (
    <div className={`connection-status ${status}`}>
      <div className="connection-status-indicator"></div>
      <div className="connection-status-text">
        {status === 'connected' ? 'Connected' : 
         status === 'connecting' ? 'Connecting...' : 
         status === 'disconnected' ? 'Disconnected' : 
         'Connection Error'}
      </div>
    </div>
  );
};

// Main Dashboard Component
const TradeSyncDashboard = () => {
  const { socket } = useSocket();
  const [marketData, setMarketData] = useState({});
  const [positions, setPositions] = useState([]);
  const [tradePerformance, setTradePerformance] = useState({ labels: [], values: [] });
  const [accountSummary, setAccountSummary] = useState({ 
    totalValue: 52481.24, 
    availableCash: 37888.52, 
    openPL: 508.97, 
    closedPL: 774.60 
  });
  const [insights, setInsights] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [selectedInsight, setSelectedInsight] = useState(null);

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        console.log('Socket Connected');
        setConnectionStatus('connected');
      });
      
      socket.on('disconnect', () => {
        console.log('Socket Disconnected');
        setConnectionStatus('disconnected');
      });
      
      socket.on('connect_error', () => {
        console.log('Socket Connection Error');
        setConnectionStatus('error');
      });
      
      socket.on('marketData', (data) => {
        setMarketData((prev) => ({ ...prev, [data.symbol]: data }));
      });
      
      socket.on('positions', (data) => {
        if (Array.isArray(data)) {
          setPositions(data);
        }
      });
      
      socket.on('tradePerformance', (data) => {
        setTradePerformance({
          labels: data.labels || ['1D', '2D', '3D', '4D', '5D'],
          values: data.values || [1000, 1050, 1100, 1080, 1150],
        });
      });
      
      socket.on('accountSummary', (data) => {
        setAccountSummary((prev) => ({ ...prev, ...data }));
      });
      
      socket.on('aiInsights', (data) => {
        if (Array.isArray(data)) {
          setInsights(data);
        }
      });
      
      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('marketData');
        socket.off('positions');
        socket.off('tradePerformance');
        socket.off('accountSummary');
        socket.off('aiInsights');
      };
    }
  }, [socket]);

  const handleInsightSelect = (insight) => {
    setSelectedInsight(insight);
  };
  
  const handleExecuteTrade = (trade) => {
    console.log('Executing trade:', trade);
    alert(`Trade executed: ${trade.action.toUpperCase()} ${trade.symbol}`);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <div className="top-bar">
          <h1>Dashboard</h1>
          <div className="top-right">
            <div className="notifications">
              <span className="notification-count">3</span>
            </div>
            <div className="trading-mode">
              <span className="mode active">PAPER</span>
              <span className="mode">LIVE</span>
            </div>
          </div>
        </div>
        <MarketOverview marketData={marketData} />
        <div className="content-columns">
          <div className="left-column">
            <AccountSummary accountSummary={accountSummary} performanceData={tradePerformance} />
            <TradingStats />
          </div>
          <div className="right-column">
            <OpenPositions positions={positions} />
            <AIInsights
              insights={insights}
              onInsightSelect={handleInsightSelect}
              onExecuteTrade={handleExecuteTrade}
              selectedInsight={selectedInsight}
            />
          </div>
        </div>
      </div>
      <ConnectionStatus status={connectionStatus} />
    </div>
  );
};

export default TradeSyncDashboard;
