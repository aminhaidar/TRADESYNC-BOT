import React, { useState, useEffect } from 'react';
import PositionsList from '../positions/PositionsList';
import AIInsightsSection from '../insights/AIInsightsSection';
import AccountSummary from '../account/AccountSummary';
import PerformanceChart from '../charts/PerformanceChart';
import './TradingDashboard.css';

const TradingDashboard = () => {
  const [isPaperTrading, setIsPaperTrading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    accountSummary: {},
    positions: [],
    insights: [],
    performanceData: [],
    marketTickers: []
  });

  useEffect(() => {
    // Fetch dashboard data from API
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboard-data');
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // For preview purposes, let's set some mock data
    setDashboardData({
      accountSummary: {
        accountValue: 52456.83,
        availableCash: 37892.14,
        todayPL: 1285.46,
        openPositions: 4,
        winRate: 78
      },
      positions: [
        {
          symbol: 'SPY',
          option_details: '490C 03/29',
          quantity: 5,
          entry_price: 4.30,
          current_price: 4.85,
          target_price: 6.45,
          stop_price: 3.87,
          expiration_date: '2025-03-29',
          source: 'IronHawk',
          entry_date: '2025-03-10'
        },
        {
          symbol: 'AAPL',
          option_details: '180C 03/22',
          quantity: 3,
          entry_price: 2.75,
          current_price: 2.98,
          target_price: 3.50,
          stop_price: 2.40,
          expiration_date: '2025-03-22',
          source: 'Sniper',
          entry_date: '2025-03-12'
        },
        {
          symbol: 'MSFT',
          option_details: '390P 04/05',
          quantity: 2,
          entry_price: 5.20,
          current_price: 5.00,
          target_price: 4.00,
          stop_price: 5.60,
          expiration_date: '2025-04-05',
          source: 'ManzTrades',
          entry_date: '2025-03-14'
        },
        {
          symbol: 'NVDA',
          option_details: '820C 04/18',
          quantity: 1,
          entry_price: 12.40,
          current_price: 14.80,
          target_price: 18.00,
          stop_price: 10.50,
          expiration_date: '2025-04-18',
          source: 'TradeSync AI',
          entry_date: '2025-03-08'
        }
      ],
      marketTickers: [
        { symbol: 'SPY', price: 483.27, change: 1.24 },
        { symbol: 'QQQ', price: 414.93, change: 1.87 },
        { symbol: 'VIX', price: 17.28, change: -5.36 }
      ]
    });
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, you would also update the body class or CSS variables
  };
  
  const toggleTradingMode = () => {
    setIsPaperTrading(!isPaperTrading);
  };

  return (
    <div className={`trading-app ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Header */}
      <header className="app-header">
        <div className="logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 13H13V16C13 16.55 12.55 17 12 17C11.45 17 11 16.55 11 16V13H8C7.45 13 7 12.55 7 12C7 11.45 7.45 11 8 11H11V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V11H16C16.55 11 17 11.45 17 12C17 12.55 16.55 13 16 13Z" fill="#388BFD"/>
          </svg>
          <h1>Trade<span className="accent">Sync</span> <span className="version-tag">v2.0</span></h1>
        </div>
        
        <div className="market-tickers">
          {dashboardData.marketTickers.map((ticker, index) => (
            <div className="ticker" key={index}>
              <span className="ticker-name">{ticker.symbol}</span>
              <span className="ticker-value">{ticker.price.toFixed(2)}</span>
              <span className={`ticker-change ${ticker.change >= 0 ? 'positive' : 'negative'}`}>
                {ticker.change >= 0 ? '+' : ''}{ticker.change}%
              </span>
            </div>
          ))}
        </div>
        
        <div className="header-controls">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 7C8.14 7 5 10.14 5 14C5 17.86 8.14 21 12 21C15.86 21 19 17.86 19 14C19 10.14 15.86 7 12 7M12 5C16.97 5 21 9.03 21 14C21 18.97 16.97 23 12 23C7.03 23 3 18.97 3 14C3 9.03 7.03 5 12 5M12 2L14.39 5.42C13.65 5.15 12.84 5 12 5C11.16 5 10.35 5.15 9.61 5.42L12 2Z" fill="#E6EDF3"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 7c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm0-5c5.97 0 11 4.03 11 9s-5.03 9-11 9-11-4.03-11-9 5.03-9 11-9zm0 18c-4.97 0-9-4.03-9-9S7.03 2 12 2s9 4.03 9 9-4.03 9-9 9z" fill="#24292F"/>
              </svg>
            )}
          </button>
          
          <div className="trading-mode-toggle">
            <label className="switch-toggle">
              <input 
                type="checkbox" 
                checked={!isPaperTrading} 
                onChange={toggleTradingMode} 
              />
              <span className="slider">
                <span className="paper-label">PAPER</span>
                <span className="live-label">LIVE</span>
              </span>
            </label>
          </div>
          
          <div className="user-profile">
            <div className="user-avatar">
              <span>TS</span>
            </div>
            <div className="user-info">
              <div className="user-name">Alex</div>
              <div className="user-plan">Bot Builder</div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Layout Controls */}
      <div className="dashboard-layout-controls">
        <button className="layout-btn active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 11h16v2H4v-2zm0-4h16v2H4V7zm0 8h16v2H4v-2z" fill="currentColor"/>
          </svg>
          Default
        </button>
        <button className="layout-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H5V7h7v10zm7 0h-5V7h5v10z" fill="currentColor"/>
          </svg>
          Trading Focus
        </button>
        <button className="layout-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="currentColor"/>
          </svg>
          Analytics
        </button>
        <button className="refresh-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
          </svg>
          Refresh
        </button>
      </div>
      
      {/* Dashboard Content */}
      <div className="dashboard-content">
        {isLoading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Account Summary */}
            <div className="account-summary-card">
              <div className="card-header">
                <h2 className="card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="#3fb950"/>
                  </svg>
                  Account Summary
                  <span className={`trading-mode ${isPaperTrading ? 'paper' : 'live'}`}>
                    {isPaperTrading ? 'PAPER' : 'LIVE'}
                  </span>
                </h2>
              </div>
              
              <div className="balance-metrics">
                <div className="balance-metric">
                  <div className="metric-icon account-value">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="metric-label">Account Value</div>
                  <div className="metric-value">${dashboardData.accountSummary.accountValue?.toLocaleString()}</div>
                </div>
                
                <div className="balance-metric">
                  <div className="metric-icon available-cash">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 18V19C21 20.1 20.1 21 19 21H5C3.89 21 3 20.1 3 19V5C3 3.9 3.89 3 5 3H19C20.1 3 21 3.9 21 5V6H12C10.89 6 10 6.9 10 8V16C10 17.1 10.89 18 12 18H21Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="metric-label">Available Cash</div>
                  <div className="metric-value">${dashboardData.accountSummary.availableCash?.toLocaleString()}</div>
                </div>
                
                <div className="balance-metric">
                  <div className="metric-icon profit">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 14L12 9L17 14H7Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="metric-label">Today's P/L</div>
                  <div className="metric-value positive">+${dashboardData.accountSummary.todayPL?.toLocaleString()}</div>
                </div>
                
                <div className="balance-metric">
                  <div className="metric-icon positions">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="metric-label">Open Positions</div>
                  <div className="metric-value">{dashboardData.accountSummary.openPositions}</div>
                </div>
                
                <div className="balance-metric">
                  <div className="metric-icon win-rate">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 5H5v14h14V5zM5 3h14c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="metric-label">Win Rate</div>
                  <div className="metric-value">{dashboardData.accountSummary.winRate}%</div>
                </div>
              </div>
            </div>
            
            {/* Positions List */}
            <PositionsList positions={dashboardData.positions} />
            
            {/* Auto Trading Controls */}
            <div className="auto-trading-card">
              <div className="card-header">
                <h2 className="card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" fill="#8957E5"/>
                  </svg>
                  AutoBot Controls
                  <span className="status-indicator active">Active</span>
                </h2>
                <div className="card-actions">
                  <button className="btn btn-warning">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z" fill="currentColor"/>
                    </svg>
                    Pause AutoBot
                  </button>
                  <button className="btn btn-secondary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.44.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor"/>
                    </svg>
                    Settings
                  </button>
                </div>
              </div>
              
              <div className="auto-trading-info">
                <div className="auto-trading-status">
                  <div className="status-metric">
                    <div className="status-label">Status</div>
                    <div className="status-value active">
                      <span className="status-dot"></span>
                      Running
                    </div>
                  </div>
                  <div className="status-metric">
                    <div className="status-label">Last Scan</div>
                    <div className="status-value">1m ago</div>
                  </div>
                  <div className="status-metric">
                    <div className="status-label">Next Scan</div>
                    <div className="status-value">4m</div>
                  </div>
                  <div className="status-metric">
                    <div className="status-label">Executed Today</div>
                    <div className="status-value">3 trades</div>
                  </div>
                </div>
                
                <div className="recent-activities">
                  <div className="activities-header">Recent Activity</div>
                  <div className="activity-list">
                    <div className="activity-item">
                      <div className="activity-icon buy">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 14l5-5 5 5H7z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="activity-details">
                        <div className="activity-title">Bought NVDA 840C 04/18</div>
                        <div className="activity-time">11:32 AM</div>
                      </div>
                      <div className="activity-value">$820.50</div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon sell">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 10l5 5 5-5H7z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="activity-details">
                        <div className="activity-title">Sold AMD 175C 03/15</div>
                        <div className="activity-time">09:45 AM</div>
                      </div>
                      <div className="activity-value positive">+$425.00</div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon system">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.44.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="activity-details">
                        <div className="activity-title">Market Scan Completed</div>
                        <div className="activity-time">09:30 AM</div>
                      </div>
                      <div className="activity-value">7 signals</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TradingDashboard;
