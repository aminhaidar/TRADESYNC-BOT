import React, { useState } from 'react';
import { Tag, Button } from '@carbon/react';
import {
  Add, 
  ChartLine, 
  Dashboard as DashboardIcon,
  Money,
  Analytics
} from '@carbon/icons-react';

import './TradeSyncDashboard.scss';

const TradeSyncDashboard = ({ 
  marketData = {}, 
  positions = [], 
  accountSummary = {},
  connectionStatus = 'connected'
}) => {
  const [expandedPosition, setExpandedPosition] = useState(null);
  
  const togglePosition = (id) => {
    setExpandedPosition(expandedPosition === id ? null : id);
  };

  // AI Insights
  const insights = [
    {
      id: 1,
      symbol: 'HOOD',
      type: 'Technical',
      sentiment: 'bullish',
      confidence: 82,
      source: '@ripster47',
      timeAgo: '47 min',
      message: 'Buy above $24.5, stop below today\'s low. Looking for a move to $28 based on volume pattern and support levels. Watching for a breakout above the daily resistance.'
    },
    {
      id: 2,
      symbol: 'BTC',
      type: 'AI Insight',
      sentiment: 'bearish',
      confidence: 75,
      source: '@AlconGordon',
      timeAgo: '30 min',
      message: '$33204 short on BTC. Significant bearish pressure building in the market. Large institutional positions being established with downside targets.'
    }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatNumber = (num, digits = 2) => {
    if (num === undefined || num === null) return '-';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  };

  return (
    <div className="tradesync-dashboard">
      <header className="tradesync-header">
        <div className="tradesync-logo">
          <div className="logo-icon">T</div>
          <span>TradeSync</span>
        </div>
        
        <div className="connection-container">
          <div className="connection-status">
            <div className={`status-indicator ${connectionStatus}`}></div>
            <span>{connectionStatus === 'connected' ? 'Connected' : 
                  connectionStatus === 'error' ? 'Connection Error' : 'Connecting...'}</span>
          </div>
          
          <div className="trading-mode">
            <button className="mode-button active">PAPER</button>
            <button className="mode-button">LIVE</button>
          </div>
        </div>
      </header>
      
      <main className="dashboard-content">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <ul>
              <li className="active">
                <DashboardIcon size={20} />
                <span>Dashboard</span>
              </li>
              <li>
                <Analytics size={20} />
                <span>AI Insights</span>
              </li>
              <li>
                <Money size={20} />
                <span>Portfolio</span>
              </li>
              <li>
                <ChartLine size={20} />
                <span>Performance</span>
              </li>
            </ul>
          </nav>
        </aside>
        
        <div className="main-content">
          <h1 className="page-title">Dashboard</h1>
          
          {/* Market Data */}
          <section className="market-data-section">
            <div className="market-tickers">
              {Object.values(marketData).map(data => {
                if (!data || !data.symbol) return null;
                
                return (
                  <div key={data.symbol} className="ticker-tile">
                    <div className="symbol">{data.symbol}</div>
                    <div className="price">
                      {data.symbol === 'BTC' ? 
                        `$${Math.round(data.price || 0).toLocaleString()}` : 
                        formatCurrency(data.price)}
                    </div>
                    <div className={`change ${data.change >= 0 ? 'positive' : 'negative'}`}>
                      {data.change >= 0 ? '+' : ''}{formatNumber(data.change, 1)}%
                    </div>
                  </div>
                );
              })}
              <div className="ticker-tile view-all">
                View All Markets
              </div>
            </div>
          </section>
          
          <div className="dashboard-grid">
            <div className="dashboard-main">
              {/* Open Positions */}
              <section className="positions-section">
                <div className="section-header">
                  <h2>Open Positions</h2>
                  <Button size="sm" kind="primary" renderIcon={Add}>New Trade</Button>
                </div>
                
                <div className="positions-list">
                  {positions.map(position => {
                    const isStock = position.type !== 'option';
                    
                    return (
                      <div 
                        key={position.id} 
                        className={`position-card ${position.isProfit ? 'profit' : 'loss'}`}
                      >
                        <div 
                          className="position-header"
                          onClick={() => togglePosition(position.id)}
                        >
                          <div className="position-info">
                            <div className="position-symbol">
                              <div className={`position-type-indicator ${isStock ? 'stock' : 'option'}`}></div>
                              <span>{isStock ? `${position.symbol} Stock` : position.symbol}</span>
                            </div>
                            
                            <div className="position-metrics">
                              <div className="metric">
                                <div className="metric-label">P/L ($)</div>
                                <div className={`metric-value ${position.isProfit ? 'positive' : 'negative'}`}>
                                  {position.isProfit ? '+' : ''}{formatCurrency(position.plValue)}
                                </div>
                              </div>
                              
                              <div className="metric">
                                <div className="metric-label">P/L (%)</div>
                                <div className={`metric-value ${position.isProfit ? 'positive' : 'negative'}`}>
                                  {position.isProfit ? '+' : ''}{formatNumber(position.plPercent, 1)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {expandedPosition === position.id && (
                          <div className="position-details">
                            <div className="position-detail-grid">
                              <div className="detail-item">
                                <div className="detail-label">Quantity</div>
                                <div className="detail-value">{position.quantity}</div>
                              </div>
                              
                              <div className="detail-item">
                                <div className="detail-label">Entry Price</div>
                                <div className="detail-value">{formatCurrency(position.entryPrice)}</div>
                              </div>
                              
                              <div className="detail-item">
                                <div className="detail-label">Current Price</div>
                                <div className="detail-value">{formatCurrency(position.currentPrice)}</div>
                              </div>
                              
                              <div className="detail-item">
                                <div className="detail-label">Cost Basis</div>
                                <div className="detail-value">{formatCurrency(position.costBasis)}</div>
                              </div>
                            </div>
                            
                            <div className="position-actions">
                              <Button size="sm" kind="tertiary">Buy More</Button>
                              <Button size="sm" kind="danger">Sell Position</Button>
                              <Button size="sm" kind="ghost">View Details</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
              
              {/* AI Trade Insights */}
              <section className="insights-section">
                <div className="section-header">
                  <h2>AI Trade Insights</h2>
                </div>
                
                <div className="sentiment-filter">
                  <span className="filter-label">Sentiment:</span>
                  <div className="tags">
                    <Tag type="green">Bullish</Tag>
                    <Tag type="red">Bearish</Tag>
                    <Tag type="gray">Neutral</Tag>
                  </div>
                </div>
                
                <div className="insights-list">
                  {insights.map(insight => (
                    <div key={insight.id} className={`insight-card ${insight.sentiment}`}>
                      <div className="insight-header">
                        <div className="insight-title">
                          <span className="symbol">{insight.symbol}</span>
                          <Tag
                            type={
                              insight.type === 'Technical' ? 'teal' :
                              insight.type === 'News' ? 'purple' :
                              insight.type === 'AI Insight' ? 'blue' : 'gray'
                            }
                          >
                            {insight.type}
                          </Tag>
                        </div>
                        
                        <div className="confidence-score">
                          <div 
                            className={
                              insight.confidence > 80 ? 'high-confidence' :
                              insight.confidence > 60 ? 'medium-confidence' : 'low-confidence'
                            }
                          >
                            {insight.confidence}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="insight-content">
                        <p>{insight.message}</p>
                      </div>
                      
                      <div className="insight-footer">
                        <div className="insight-source">
                          <span>{insight.source}</span>
                          <span className="time-ago">{insight.timeAgo} ago</span>
                        </div>
                        
                        <div className="insight-actions">
                          {insight.id === 1 ? (
                            <>
                              <Button size="sm" kind="primary">Buy Now</Button>
                              <Button size="sm" kind="danger">Sell Now</Button>
                            </>
                          ) : (
                            <Button size="sm" kind="tertiary">View Trade</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            
            <div className="dashboard-sidebar">
              {/* Account Summary */}
              <section className="account-summary-section">
                <h2>Account Summary</h2>
                
                <div className="total-value">
                  {formatCurrency(accountSummary.totalValue || 0)}
                </div>
                
                <div className="cash-availability">
                  <div className="label">Available Cash</div>
                  <div className="value">{formatCurrency(accountSummary.availableCash || 0)}</div>
                </div>
                
                <div className="pl-overview">
                  <div className="pl-item">
                    <div className="label">Open P/L</div>
                    <div className={`value ${(accountSummary.openPL || 0) >= 0 ? 'positive' : 'negative'}`}>
                      {(accountSummary.openPL || 0) >= 0 ? '+' : ''}{formatCurrency(accountSummary.openPL || 0)}
                    </div>
                  </div>
                  
                  <div className="pl-item">
                    <div className="label">Closed P/L</div>
                    <div className={`value ${(accountSummary.closedPL || 0) >= 0 ? 'positive' : 'negative'}`}>
                      {(accountSummary.closedPL || 0) >= 0 ? '+' : ''}{formatCurrency(accountSummary.closedPL || 0)}
                    </div>
                  </div>
                </div>
              </section>
              
              {/* Trading Stats */}
              <section className="trading-stats-section">
                <h2>Trading Stats</h2>
                
                <div className="stat-item">
                  <div className="stat-label">Win Rate</div>
                  <div className="stat-value">78% (21/27)</div>
                </div>
                
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">Average Gain</div>
                    <div className="stat-value positive">+14.2%</div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-label">Average Loss</div>
                    <div className="stat-value negative">-8.6%</div>
                  </div>
                </div>
              </section>
              
              {/* Performance Chart */}
              <section className="performance-section">
                <h2>Performance</h2>
                
                <div className="timeframe-tabs">
                  <div className="tab active">1D</div>
                  <div className="tab">1W</div>
                  <div className="tab">1M</div>
                  <div className="tab">3M</div>
                  <div className="tab">1Y</div>
                </div>
                
                <div className="performance-chart">
                  <div className="chart-placeholder"></div>
                  <div className="gain-badge positive">+2.45%</div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TradeSyncDashboard;
