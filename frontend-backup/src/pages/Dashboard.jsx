import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import ErrorBoundary from '../ErrorBoundary';
import Trades from '../Trades';

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  transports: ['polling'],
  forceNew: true,
});

const Dashboard = () => {
  const [marketData, setMarketData] = useState({});
  const [portfolio, setPortfolio] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [theme, setTheme] = useState('ocean');

  useEffect(() => {
    console.log('Dashboard mounted');

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'ocean';
    setTheme(savedTheme);
    document.body.className = `theme-${savedTheme}`;

    // Ensure socket is disconnected before connecting
    if (socket.connected) {
      socket.disconnect();
    }

    // Delay socket connection to avoid race conditions
    const connectSocket = setTimeout(() => {
      socket.connect();
    }, 500);

    // Fetch initial market data with error handling
    const fetchMarketData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/market_data`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Initial market data:', data);
        setMarketData(data || {});
      } catch (error) {
        console.error('Error fetching market data:', error.message);
        setMarketData({});
      }
    };

    // Fetch initial portfolio with error handling
    const fetchPortfolio = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/portfolio`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Initial portfolio data:', data);
        setPortfolio(data || { cash: 0, positions: [], total_value: 0 });
      } catch (error) {
        console.error('Error fetching portfolio:', error.message);
        setPortfolio({ cash: 0, positions: [], total_value: 0 });
      }
    };

    fetchMarketData();
    fetchPortfolio();

    // WebSocket event listeners with detailed logging
    socket.on('connect', () => {
      console.log('Connected to server via polling');
      setConnectionStatus('connected');
    });

    socket.on('indices_update', (data) => {
      console.log('Received indices_update:', data);
      setMarketData(data || {});
    });

    socket.on('portfolio_update', (data) => {
      console.log('Received portfolio_update:', data);
      setPortfolio(data || { cash: 0, positions: [], total_value: 0 });
    });

    socket.on('trade_alert', (alert) => {
      console.log('New trade alert received:', alert);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      setConnectionStatus('disconnected');
    });

    socket.on('reconnect_attempt', (attempt) => {
      console.log('Reconnection attempt:', attempt);
      setConnectionStatus('connecting');
    });

    socket.on('reconnect_failed', () => {
      console.error('Reconnection failed after maximum attempts');
      setConnectionStatus('disconnected');
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server, reason:', reason);
      setConnectionStatus('disconnected');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Cleanup on unmount
    return () => {
      console.log('Dashboard unmounted');
      clearTimeout(connectSocket);
      socket.off('connect');
      socket.off('indices_update');
      socket.off('portfolio_update');
      socket.off('trade_alert');
      socket.off('connect_error');
      socket.off('reconnect_attempt');
      socket.off('reconnect_failed');
      socket.off('disconnect');
      socket.off('error');
      socket.disconnect();
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleThemeDropdown = () => {
    setThemeDropdownOpen(!themeDropdownOpen);
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = `theme-${newTheme}`;
    setThemeDropdownOpen(false);
  };

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '$0.00';
    const numValue = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  };

  const refreshMarketData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/market_data`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Refreshed market data:', data);
      setMarketData(data || {});
    } catch (error) {
      console.error('Error fetching market data:', error.message);
    }
  };

  const refreshPortfolio = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/portfolio`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Refreshed portfolio data:', data);
      setPortfolio(data || { cash: 0, positions: [], total_value: 0 });
    } catch (error) {
      console.error('Error fetching portfolio:', error.message);
    }
  };

  return (
    <ErrorBoundary>
      <div className="app-container">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'show' : ''}`} id="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo-icon">TS</div>
            <h1 className="sidebar-logo">TradeSync</h1>
          </div>

          <nav className="sidebar-nav">
            <div className="sidebar-nav-heading">Main</div>
            <a href="#" className="sidebar-nav-item active">
              <i className="fas fa-chart-line sidebar-nav-icon"></i>
              <span>Dashboard</span>
            </a>
            <a href="#" className="sidebar-nav-item">
              <i className="fas fa-wallet sidebar-nav-icon"></i>
              <span>Portfolio</span>
            </a>
            <a href="#" className="sidebar-nav-item">
              <i className="fas fa-exchange-alt sidebar-nav-icon"></i>
              <span>Trade</span>
            </a>
            <a href="#" className="sidebar-nav-item">
              <i className="fas fa-history sidebar-nav-icon"></i>
              <span>History</span>
            </a>

            <div className="sidebar-nav-heading">Analytics</div>
            <a href="#" className="sidebar-nav-item">
              <i className="fas fa-chart-bar sidebar-nav-icon"></i>
              <span>Performance</span>
            </a>
            <a href="#" className="sidebar-nav-item">
              <i className="fas fa-bell sidebar-nav-icon"></i>
              <span>Alerts</span>
            </a>
            <a href="#" className="sidebar-nav-item">
              <i className="fas fa-robot sidebar-nav-icon"></i>
              <span>Signals</span>
            </a>

            <div className="sidebar-nav-heading">Settings</div>
            <a href="#" className="sidebar-nav-item">
              <i className="fas fa-cog sidebar-nav-icon"></i>
              <span>Preferences</span>
            </a>
            <a href="#" className="sidebar-nav-item">
              <i className="fas fa-key sidebar-nav-icon"></i>
              <span>API Keys</span>
            </a>
          </nav>

          <div className="sidebar-user">
            <div className="user-info">
              <div className="user-avatar">T</div>
              <div className="user-details">
                <div className="user-name">Test User</div>
                <div className="user-email">testuser@example.com</div>
              </div>
            </div>
            <div className="user-actions mt-3">
              <button className="user-action-btn">
                <i className="fas fa-cog"></i>
              </button>
              <Link to="/" className="user-action-btn">
                <i className="fas fa-sign-out-alt"></i>
              </Link>
            </div>
          </div>
        </aside>

        {/* Backdrop for Mobile Sidebar */}
        <div className={`sidebar-backdrop ${sidebarOpen ? 'show' : ''}`} id="sidebar-backdrop" onClick={closeSidebar}></div>

        {/* Main Content */}
        <main className="main-content">
          <header className="header">
            <div className="flex items-center">
              <button className="sidebar-toggle" id="sidebar-toggle" onClick={toggleSidebar}>
                <i className="fas fa-bars"></i>
              </button>
              <h1 className="header-title">Dashboard</h1>
            </div>

            <div className="header-actions">
              <div className="theme-switcher relative" id="theme-switcher">
                <button className="theme-switcher-button" onClick={toggleThemeDropdown}>
                  <i className="fas fa-palette"></i>
                </button>
                <div className={`theme-switcher-dropdown ${themeDropdownOpen ? 'open' : ''}`}>
                  <div className="theme-option" onClick={() => changeTheme('dark')}>
                    <div className="theme-color default"></div>
                    <span>Default</span>
                  </div>
                  <div className="theme-option" onClick={() => changeTheme('ocean')}>
                    <div className="theme-color ocean"></div>
                    <span>Ocean</span>
                  </div>
                  <div className="theme-option" onClick={() => changeTheme('emerald')}>
                    <div className="theme-color emerald"></div>
                    <span>Emerald</span>
                  </div>
                  <div className="theme-option" onClick={() => changeTheme('purple')}>
                    <div className="theme-color purple"></div>
                    <span>Purple</span>
                  </div>
                  <div className="theme-option" onClick={() => changeTheme('crimson')}>
                    <div className="theme-color crimson"></div>
                    <span>Crimson</span>
                  </div>
                </div>
              </div>

              <div className={`connection-status ${connectionStatus}`} id="connection-status">
                {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'disconnected' ? 'Disconnected' : 'Connecting...'}
              </div>

              <Link to="/" className="btn btn-sm btn-outline">
                <i className="fas fa-sign-out-alt mr-1"></i> Logout
              </Link>
            </div>
          </header>

          {/* Welcome Panel */}
          <div className="welcome-panel slide-in">
            <h2 className="welcome-title">Welcome to TradeSync, Test User</h2>
            <p className="welcome-subtitle">Your intelligent trading platform for real-time market data, portfolio tracking, and automated signals.</p>
            <div className="welcome-actions">
              <button className="btn btn-primary">
                <i className="fas fa-rocket mr-1"></i> Quick Start Guide
              </button>
              <button className="btn btn-outline">
                <i className="fas fa-cog mr-1"></i> Configure Settings
              </button>
            </div>
          </div>

          {/* Market Overview */}
          <div className="card fade-in">
            <div className="card-header">
              <h2 className="card-title">
                <i className="fas fa-chart-line"></i> Market Overview
              </h2>
              <div className="card-actions">
                <button onClick={refreshMarketData} className="btn btn-sm btn-outline" id="refresh-market">
                  <i className="fas fa-sync-alt mr-1"></i> Refresh
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="market-indices" id="market-indices">
                {Object.keys(marketData).length === 0 ? (
                  <div className="text-center text-secondary">Loading market data...</div>
                ) : (
                  <>
                    {/* S&P 500 */}
                    {marketData.SPX && (
                      <div className="index-card">
                        <div className="index-name">S&P 500</div>
                        <div className="index-value" id="spx-value">
                          {formatCurrency(marketData.SPX.price)}
                        </div>
                        <div
                          className={`index-change ${
                            parseFloat(marketData.SPX.change) > 0
                              ? 'text-success'
                              : parseFloat(marketData.SPX.change) < 0
                              ? 'text-danger'
                              : 'text-secondary'
                          }`}
                          id="spx-change"
                        >
                          <i
                            className={`fas fa-arrow-${
                              parseFloat(marketData.SPX.change) > 0 ? 'up' : 'down'
                            }`}
                          ></i>{' '}
                          {parseFloat(marketData.SPX.change)?.toFixed(2) || 'N/A'}%
                        </div>
                      </div>
                    )}

                    {/* NASDAQ */}
                    {marketData.QQQ && (
                      <div className="index-card">
                        <div className="index-name">NASDAQ</div>
                        <div className="index-value" id="qqq-value">
                          {formatCurrency(marketData.QQQ.price)}
                        </div>
                        <div
                          className={`index-change ${
                            parseFloat(marketData.QQQ.change) > 0
                              ? 'text-success'
                              : parseFloat(marketData.QQQ.change) < 0
                              ? 'text-danger'
                              : 'text-secondary'
                          }`}
                          id="qqq-change"
                        >
                          <i
                            className={`fas fa-arrow-${
                              parseFloat(marketData.QQQ.change) > 0 ? 'up' : 'down'
                            }`}
                          ></i>{' '}
                          {parseFloat(marketData.QQQ.change)?.toFixed(2) || 'N/A'}%
                        </div>
                      </div>
                    )}

                    {/* Russell 2000 */}
                    {marketData.IWM && (
                      <div className="index-card">
                        <div className="index-name">Russell 2000</div>
                        <div className="index-value" id="iwm-value">
                          {formatCurrency(marketData.IWM.price)}
                        </div>
                        <div
                          className={`index-change ${
                            parseFloat(marketData.IWM.change) > 0
                              ? 'text-success'
                              : parseFloat(marketData.IWM.change) < 0
                              ? 'text-danger'
                              : 'text-secondary'
                          }`}
                          id="iwm-change"
                        >
                          <i
                            className={`fas fa-arrow-${
                              parseFloat(marketData.IWM.change) > 0 ? 'up' : 'down'
                            }`}
                          ></i>{' '}
                          {parseFloat(marketData.IWM.change)?.toFixed(2) || 'N/A'}%
                        </div>
                      </div>
                    )}

                    {/* VIX */}
                    {marketData.VIX && (
                      <div className="index-card">
                        <div className="index-name">VIX</div>
                        <div className="index-value" id="vix-value">
                          {formatCurrency(marketData.VIX.price)}
                        </div>
                        <div
                          className={`index-change ${
                            parseFloat(marketData.VIX.change) > 0
                              ? 'text-success'
                              : parseFloat(marketData.VIX.change) < 0
                              ? 'text-danger'
                              : 'text-secondary'
                          }`}
                          id="vix-change"
                        >
                          <i
                            className={`fas fa-arrow-${
                              parseFloat(marketData.VIX.change) > 0 ? 'up' : 'down'
                            }`}
                          ></i>{' '}
                          {parseFloat(marketData.VIX.change)?.toFixed(2) || 'N/A'}%
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Portfolio Summary */}
          <div className="card fade-in">
            <div className="card-header">
              <h2 className="card-title">
                <i className="fas fa-wallet"></i> Portfolio Summary
              </h2>
              <div className="card-actions">
                <button onClick={refreshPortfolio} className="btn btn-sm btn-outline" id="refresh-portfolio">
                  <i className="fas fa-sync-alt mr-1"></i> Refresh
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="portfolio-metrics">
                <div className="metric-card">
                  <div className="metric-title">
                    <i className="fas fa-chart-pie"></i> Portfolio Value
                  </div>
                  <div className="metric-value" id="portfolio-value">
                    {portfolio.total_value ? formatCurrency(portfolio.total_value) : '$0.00'}
                  </div>
                  <div className="metric-change positive" id="portfolio-change">
                    <i className="fas fa-arrow-up"></i> +2.4%
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-title">
                    <i className="fas fa-money-bill-wave"></i> Cash Balance
                  </div>
                  <div className="metric-value" id="cash-balance">
                    {portfolio.cash ? formatCurrency(portfolio.cash) : '$0.00'}
                  </div>
                  <div className="text-xs text-secondary">Available for Trading</div>
                </div>
                <div className="metric-card">
                  <div className="metric-title">
                    <i className="fas fa-chart-line"></i> Today's P/L
                  </div>
                  <div className="metric-value text-success" id="daily-pl">
                    $1,245.80
                  </div>
                  <div className="metric-change positive" id="daily-pl-percent">
                    <i className="fas fa-arrow-up"></i> +0.88%
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-title">
                    <i className="fas fa-bolt"></i> Buying Power
                  </div>
                  <div className="metric-value" id="buying-power">
                    {portfolio.cash ? formatCurrency(portfolio.cash * 4) : '$0.00'}
                  </div>
                  <div className="text-xs text-secondary">4x Margin Available</div>
                </div>
              </div>
            </div>
          </div>

          {/* Positions */}
          <div className="card fade-in">
            <div className="card-header">
              <h2 className="card-title">
                <i className="fas fa-briefcase"></i> Positions
              </h2>
              <div className="card-actions">
                <button className="btn btn-sm btn-outline-primary">
                  <i className="fas fa-plus mr-1"></i> New Position
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th className="text-right">Quantity</th>
                      <th className="text-right">Entry Price</th>
                      <th className="text-right">Current Price</th>
                      <th className="text-right">Market Value</th>
                      <th className="text-right">Unrealized P/L</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody id="positions-table">
                    {portfolio.positions && portfolio.positions.length > 0 ? (
                      portfolio.positions.map((pos, index) => (
                        <tr key={index}>
                          <td>
                            <div className="symbol-cell">
                              <div className="symbol-icon">{pos.symbol?.substring(0, 2) || 'N/A'}</div>
                              <div className="symbol-text">{pos.symbol || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="text-right">{pos.qty || '0'}</td>
                          <td className="text-right">{formatCurrency(pos.avg_entry_price)}</td>
                          <td className="text-right">{formatCurrency(pos.current_price)}</td>
                          <td className="text-right">{formatCurrency(pos.market_value)}</td>
                          <td className="text-right">
                            <div className={parseFloat(pos.profit_loss) >= 0 ? 'text-success' : 'text-danger'}>
                              {formatCurrency(pos.profit_loss)}{' '}
                              <span className="text-xs">
                                ({parseFloat(pos.profit_loss / pos.avg_entry_price * 100)?.toFixed(2) || '0.00'}%)
                              </span>
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="flex justify-center gap-1">
                              <button className="btn-icon btn-icon-sm btn-outline" title="Buy More">
                                <i className="fas fa-plus"></i>
                              </button>
                              <button className="btn-icon btn-icon-sm btn-outline" title="Sell">
                                <i className="fas fa-minus"></i>
                              </button>
                              <button className="btn-icon btn-icon-sm btn-outline" title="View Details">
                                <i className="fas fa-chart-bar"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-secondary">
                          <i className="fas fa-info-circle text-lg mb-2"></i>
                          <div>No positions available</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer">
              <div className="text-sm text-secondary">
                <i className="fas fa-info-circle mr-1"></i> Positions are updated every 5 minutes automatically.
              </div>
            </div>
          </div>

          {/* Recent Trades and Trade Alerts */}
          <Trades socket={socket} />
        </main>

        {/* Mobile Navigation Bar */}
        <div className="mobile-navbar">
          <div className="mobile-navbar-nav">
            <a href="#" className="mobile-nav-item active">
              <i className="fas fa-chart-line"></i>
              <span>Dashboard</span>
            </a>
            <a href="#" className="mobile-nav-item">
              <i className="fas fa-wallet"></i>
              <span>Portfolio</span>
            </a>
            <a href="#" className="mobile-nav-item">
              <i className="fas fa-exchange-alt"></i>
              <span>Trade</span>
            </a>
            <a href="#" className="mobile-nav-item">
              <i className="fas fa-bell"></i>
              <span>Alerts</span>
            </a>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;