import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import EnhancedAIInsights from './EnhancedAIInsights';
import './ModernDashboard.css';

const EnhancedModernDashboard = () => {
  const { isConnected } = useSocket();
  const { darkMode, toggleTheme } = useTheme();
  const [marketData, setMarketData] = useState([]);
  const [isPaperTrading, setIsPaperTrading] = useState(true);
  const [dashboardData, setDashboardData] = useState({});

  useEffect(() => {
    fetch('http://localhost:5001/api/dashboard-data')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched dashboard data:', data);
        setDashboardData(data);
        if (data.marketData) setMarketData(data.marketData);
      })
      .catch(error => console.error('Error fetching dashboard data:', error));

    const socket = window.socket;
    if (socket) {
      socket.on('market_update', (data) => {
        console.log('Market update received:', data);
        setMarketData(data);
      });
      return () => socket.off('market_update');
    }
  }, []);

  const handleRefresh = () => {
    console.log('Manual refresh requested');
    fetch('http://localhost:5001/api/dashboard-data')
      .then(response => response.json())
      .then(data => {
        console.log('Refreshed dashboard data:', data);
        setDashboardData(data);
        if (data.marketData) setMarketData(data.marketData);
      })
      .catch(error => console.error('Error refreshing data:', error));
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-theme' : 'light-theme'}`}>
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
      <button className="theme-toggle-btn" onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
};

export default EnhancedModernDashboard;
