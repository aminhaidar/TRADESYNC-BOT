import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import EnhancedAIInsights from './EnhancedAIInsights';
import './TradeSyncDashboard.css';

const TradeSyncDashboard = () => {
  const { isConnected } = useSocket();
  const { darkMode, toggleTheme } = useTheme();
  const [marketData, setMarketData] = useState([]);
  const [dashboardData, setDashboardData] = useState({});
  const [tradePerformance, setTradePerformance] = useState({});
  const [expandedPosition, setExpandedPosition] = useState(null);
  const [insightsFilter, setInsightsFilter] = useState({ category: 'all', subcategory: 'all', sentiment: 'all', source: 'all', dateRange: 'all' });
  const [searchQuery, setSearchQuery] = useState('');

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
      socket.on('live_trade_update', (trade) => {
        console.log('Trade update received:', trade);
      });
      return () => {
        socket.off('market_update');
        socket.off('live_trade_update');
      };
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

  // Calculate trade performance by source
  useEffect(() => {
    const calculatePerformance = () => {
      const performance = {};
      dashboardData.trades?.forEach(trade => {
        const source = trade.source || 'Unknown';
        if (!performance[source]) {
          performance[source] = { wins: 0, losses: 0, totalPL: 0, trades: 0 };
        }
        performance[source].trades += 1;
        performance[source].totalPL += (trade.current_price - trade.price) || 0;
        if ((trade.current_price - trade.price) > 0) performance[source].wins += 1;
        else if ((trade.current_price - trade.price) < 0) performance[source].losses += 1;
      });
      Object.keys(performance).forEach(source => {
        performance[source].winRate = (performance[source].wins / performance[source].trades * 100).toFixed(1) || 0;
      });
      setTradePerformance(performance);
    };
    calculatePerformance();
  }, [dashboardData.trades]);

  // Calculate insights overview
  const insightsOverview = {
    total: dashboardData?.insights?.length || 0,
    actionable: dashboardData?.insights?.filter(i => i.category === 'Actionable Trade')?.length || 0,
    sentiment: dashboardData?.insights?.reduce((acc, i) => {
      if (i.recommendation === 'Buy') return acc + 1;
      if (i.recommendation === 'Sell') return acc - 1;
      return acc;
    }, 0) || 0,
    topTickers: [...new Set(dashboardData?.insights?.map(i => i.symbol) || [])].slice(0, 3)
  };

  const togglePositionExpand = (positionId) => {
    setExpandedPosition(expandedPosition === positionId ? null : positionId);
  };

  // Filter insights based on criteria
  const filteredInsights = dashboardData?.insights?.filter(insight => {
    const mappedCategory = insight.category === 'actionable' ? 'Actionable Trade' : insight.category === 'technical' ? 'AI Insight' : 'General Insight';
    const matchesCategory = insightsFilter.category === 'all' || mappedCategory === insightsFilter.category;
    const matchesSubcategory = insightsFilter.subcategory === 'all' || insight.subcategory === insightsFilter.subcategory;
    const matchesSentiment = insightsFilter.sentiment === 'all' || insight.recommendation === insightsFilter.sentiment;
    const matchesSource = insightsFilter.source === 'all' || insight.source === insightsFilter.source;
    const matchesDate = insightsFilter.dateRange === 'all' || true; // Placeholder for date range filtering
    const matchesSearch = searchQuery === '' || 
      insight.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
      insight.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSubcategory && matchesSentiment && matchesSource && matchesDate && matchesSearch;
  }) || [];

  return (
    <div className={`trade-sync-dashboard ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Header with Logo and User Profile */}
      <header className="app-header">
        <div className="logo">TradeSync</div>
        <div className="user-profile">👤</div>
      </header>

      {/* Market Indices Section */}
      <div className="market-indices-section">
        {['SPY', 'IWM', 'QQQ', 'DIA'].map(symbol => {
          const data = marketData.find(md => md.symbol === symbol) || { price: 0, changePercent: 0 };
          return (
            <div key={symbol} className="market-index">
              <span className="index-symbol">{symbol}</span>
              <span className="index-price">${data.price?.toFixed(2) || 'N/A'}</span>
              <span className={`index-change ${data.changePercent >= 0 ? 'positive' : 'negative'}`}>
                {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Dashboard Layout */}
      <div className="dashboard-layout">
        {/* Main Panel (Left) */}
        <div className="main-panel">
          {/* Open Positions */}
          <div className="positions-section">
            <div className="section-header">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
                </svg>
                Open Positions
              </h2>
            </div>
            <div className="positions-list">
              {dashboardData?.positions?.map((position, index) => {
                const purchasePrice = position.averagePrice;
                const lastPrice = position.currentPrice;
                const returnValue = (lastPrice - purchasePrice) * position.quantity;
                const roundedReturn = Math.round(Math.abs(returnValue));
                return (
                  <div
                    key={index}
                    className={`position-card ${returnValue >= 0 ? 'profit' : 'loss'} ${expandedPosition === position.symbol ? 'expanded' : ''}`}
                  >
                    <div
                      className="position-header"
                      onClick={() => togglePositionExpand(position.symbol)}
                    >
                      <span className="position-ticker">{position.symbol}</span>
                      <span>Purchase: ${purchasePrice?.toFixed(2)}</span>
                      <span>Last: ${lastPrice?.toFixed(2)}</span>
                      <span className={returnValue >= 0 ? 'positive' : 'negative'}>
                        {returnValue >= 0 ? '+' : '-'}${roundedReturn}
                      </span>
                    </div>
                    {expandedPosition === position.symbol && (
                      <div className="position-details">
                        <div className="position-metrics">
                          <div className="metric">
                            <span>Quantity</span>
                            <span>{position.quantity}</span>
                          </div>
                          <div className="metric">
                            <span>Entry Price</span>
                            <span>${position.averagePrice?.toFixed(2)}</span>
                          </div>
                          <div className="metric">
                            <span>Change %</span>
                            <span>{position.changePercent.toFixed(2)}%</span>
                          </div>
                        </div>
                        <div className="position-actions">
                          <button className="btn btn-scale" onClick={() => console.log('Scale 25%')}>Scale 25%</button>
                          <button className="btn btn-scale" onClick={() => console.log('Scale 50%')}>Scale 50%</button>
                          <button className="btn btn-scale" onClick={() => console.log('Scale 75%')}>Scale 75%</button>
                          <button className="btn btn-close" onClick={() => console.log('Close Position')}>Close</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Insights */}
          <div className="insights-section">
            <div className="section-header">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                  <path d="M11 7H13V9H11V7ZM11 11H13V17H11V11Z" fill="currentColor"/>
                </svg>
                AI Trade Insights
              </h2>
              <div className="section-actions">
                <select
                  value={insightsFilter.category}
                  onChange={(e) => setInsightsFilter({ ...insightsFilter, category: e.target.value })}
                  className="filter-select"
                >
                  <option value="all">All Categories</option>
                  <option value="Actionable Trade">Actionable Trade</option>
                  <option value="AI Insight">AI Insight</option>
                  <option value="General Insight">General Insight</option>
                </select>
                <select
                  value={insightsFilter.sentiment}
                  onChange={(e) => setInsightsFilter({ ...insightsFilter, sentiment: e.target.value })}
                  className="filter-select"
                >
                  <option value="all">All Sentiments</option>
                  <option value="Buy">Bullish</option>
                  <option value="Sell">Bearish</option>
                  <option value="Neutral">Neutral</option>
                </select>
                <button className="btn btn-refresh" onClick={handleRefresh}>Refresh</button>
              </div>
            </div>
            <div className="insights-search">
              <input
                type="text"
                placeholder="Search by ticker or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="insights-overview">
              <div className="overview-metric">
                <span>Total Insights</span>
                <span>{insightsOverview.total}</span>
              </div>
              <div className="overview-metric">
                <span>Actionable Trades</span>
                <span>{insightsOverview.actionable}</span>
              </div>
              <div className="overview-metric">
                <span>Sentiment</span>
                <span className={insightsOverview.sentiment >= 0 ? 'positive' : 'negative'}>
                  {insightsOverview.sentiment >= 0 ? 'Bullish' : 'Bearish'} ({insightsOverview.sentiment})
                </span>
              </div>
              <div className="overview-metric">
                <span>Top Tickers</span>
                <span>{insightsOverview.topTickers.join(', ') || 'N/A'}</span>
              </div>
            </div>
            <EnhancedAIInsights insights={filteredInsights} />
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          {/* Portfolio Summary */}
          <div className="portfolio-section">
            <div className="section-header">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
                </svg>
                Portfolio Summary
              </h2>
            </div>
            <div className="portfolio-summary">
              <div className="summary-metric">
                <span>Total Balance</span>
                <span>${Math.round(dashboardData?.metrics?.balance) || 'N/A'}</span>
              </div>
              <div className="summary-metric">
                <span>Day P/L</span>
                <span>${Math.round(dashboardData?.metrics?.dayPnl) || 'N/A'}</span>
              </div>
              <div className="summary-metric">
                <span>Total P/L</span>
                <span>${Math.round(dashboardData?.metrics?.totalPnl) || 'N/A'}</span>
              </div>
              <div className="summary-metric">
                <span>Open Positions</span>
                <span>{dashboardData?.metrics?.openPositions || 'N/A'}</span>
              </div>
              <div className="portfolio-chart">
                <p>Chart Placeholder (Add Chart.js integration)</p>
              </div>
            </div>
          </div>

          {/* Trade Performance by Source */}
          <div className="trade-performance-section">
            <h3>Trade Performance by Source</h3>
            {Object.entries(tradePerformance).map(([source, stats]) => (
              <div key={source} className="performance-bar">
                <span>{source}</span>
                <div className="bar-chart">
                  <div className="wins" style={{ width: `${stats.winRate}%` }}></div>
                  <div className="losses" style={{ width: `${100 - stats.winRate}%` }}></div>
                </div>
                <span>Total P/L: ${Math.round(stats.totalPL)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeSyncDashboard;
