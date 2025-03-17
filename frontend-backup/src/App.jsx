import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import './App.css';

function App() {
  const [dashboardData, setDashboardData] = useState({ trades: [], insights: [] });
  const [performanceChart, setPerformanceChart] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/dashboard-data');
        setDashboardData(response.data);

        // Update performance chart
        if (performanceChart) {
          performanceChart.destroy();
        }
        const ctx = document.getElementById('performanceChart').getContext('2d');
        setPerformanceChart(new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Mar 8', 'Mar 9', 'Mar 10', 'Mar 11', 'Mar 12', 'Mar 13', 'Mar 14'],
            datasets: [
              {
                label: 'TradeSync Bot Performance',
                data: [0, 5.2, 8.7, 12.4, 17.8, 25.3, 31.4],
                borderColor: '#3fb950',
                backgroundColor: 'rgba(63, 185, 80, 0.1)',
                tension: 0.4,
                fill: true
              },
              {
                label: 'SPY Benchmark',
                data: [0, 0.7, 1.2, 0.8, 1.5, 2.1, 2.4],
                borderColor: '#8b949e',
                backgroundColor: 'rgba(139, 148, 158, 0.1)',
                tension: 0.4,
                borderDash: [5, 5],
                fill: false
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  color: '#e6edf3',
                  font: { size: 11 },
                  padding: 15
                }
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                  label: function(context) {
                    return context.dataset.label + ': ' + context.parsed.y + '%';
                  }
                }
              }
            },
            scales: {
              y: {
                display: true,
                grid: { color: 'rgba(48, 54, 61, 0.5)', drawBorder: false },
                ticks: { color: '#8b949e', callback: value => value + '%' }
              },
              x: {
                display: true,
                grid: { display: false },
                ticks: { color: '#8b949e' }
              }
            }
          }
        }));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const handleTabClick = (e) => {
    const tabs = e.target.parentElement.querySelectorAll('.tab');
    tabs.forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
  };

  const handleToggleClick = (e) => {
    const group = e.target.parentElement.querySelectorAll('.toggle-btn');
    group.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
  };

  const handleScaleClick = (e) => {
    alert('Scaling out ' + e.target.querySelector('.scale-value').textContent + ' of position');
  };

  return (
    <div className="container">
      <header>
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 13H13V16C13 16.55 12.55 17 12 17C11.45 17 11 16.55 11 16V13H8C7.45 13 7 12.55 7 12C7 11.45 7.45 11 8 11H11V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V11H16C16.55 11 17 11.45 17 12C17 12.55 16.55 13 16 13Z" fill="#388BFD"/>
          </svg>
          <h1>Trade<span>Sync</span></h1>
        </div>
        <div className="market-tickers">
          <div className="ticker">
            <span className="ticker-name">SPY</span>
            <span className="ticker-value">483.27</span>
            <span className="ticker-change positive">+1.24%</span>
          </div>
          <div className="ticker">
            <span className="ticker-name">QQQ</span>
            <span className="ticker-value">414.93</span>
            <span className="ticker-change positive">+1.87%</span>
          </div>
          <div className="ticker">
            <span className="ticker-name">VIX</span>
            <span className="ticker-value">17.28</span>
            <span className="ticker-change negative">-5.36%</span>
          </div>
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
      </header>

      <div className="dashboard">
        <div className="main-content">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="#3FB950"/>
                </svg>
                Account & Positions
              </h2>
              <div className="card-actions">
                <label className="account-toggle tooltip">
                  <input type="checkbox" />
                  <span className="account-slider">
                    <span className="paper">PAPER</span>
                    <span className="live">LIVE</span>
                  </span>
                  <span className="tooltiptext">Toggle between paper and live trading</span>
                </label>
                <button className="btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
            <div className="balance-row">
              <div className="balance-card">
                <div className="balance-label">Account Value</div>
                <div className="balance-value">$52,347.82</div>
              </div>
              <div className="balance-card">
                <div className="balance-label">Available Cash</div>
                <div className="balance-value">$24,860.15</div>
              </div>
              <div className="balance-card">
                <div className="balance-label">Today's P/L</div>
                <div className="balance-value positive">+$1,432.68</div>
              </div>
              <div className="balance-card">
                <div className="balance-label">Open Positions</div>
                <div className="balance-value">3</div>
              </div>
            </div>
            <div className="positions-list">
              {dashboardData.trades
                .filter(trade => trade.action === 'buy' && !trade.closed)
                .map((trade, index) => (
                  <div key={index} className={`position-card ${trade.price > (trade.closed_timestamp ? parseFloat(trade.closed_timestamp.split(',').pop()) : 0) ? 'profit' : 'loss'}`}>
                    <div className="position-header">
                      <div className="position-ticker">
                        {trade.symbol} {trade.option_details || ''} {trade.timestamp.split(' ')[0]}
                      </div>
                      <div className={`position-pl ${trade.price > (trade.closed_timestamp ? parseFloat(trade.closed_timestamp.split(',').pop()) : 0) ? 'positive' : 'negative'}`}>
                        {((trade.price / (trade.closed_timestamp ? parseFloat(trade.closed_timestamp.split(',').pop()) : trade.price) - 1) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="position-details">
                      <div className="position-detail">
                        <div className="position-label">Contracts</div>
                        <div className="position-value">{trade.quantity}</div>
                      </div>
                      <div className="position-detail">
                        <div className="position-label">Current</div>
                        <div className="position-value">{trade.price}</div>
                      </div>
                      <div className="position-detail">
                        <div className="position-label">Entry</div>
                        <div className="position-value">{trade.price}</div>
                      </div>
                      <div className="position-detail">
                        <div className="position-label">Target</div>
                        <div className="position-value">{(trade.price * 1.5).toFixed(2)}</div>
                      </div>
                      <div className="position-detail">
                        <div className="position-label">Stop</div>
                        <div className="position-value">{(trade.price * 0.95).toFixed(2)}</div>
                      </div>
                      <div className="position-detail">
                        <div className="position-label">P/L</div>
                        <div className={`position-value ${trade.price > (trade.closed_timestamp ? parseFloat(trade.closed_timestamp.split(',').pop()) : 0) ? 'positive' : 'negative'}`}>
                          {((trade.price - (trade.closed_timestamp ? parseFloat(trade.closed_timestamp.split(',').pop()) : trade.price)) * trade.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="scale-controls">
                      <div className="scale-btn tooltip" onClick={handleScaleClick}>
                        <div className="scale-value">25%</div>
                        <div className="scale-label">Close</div>
                        <span className="tooltiptext">Close 25% of position</span>
                      </div>
                      <div className="scale-btn tooltip" onClick={handleScaleClick}>
                        <div className="scale-value">50%</div>
                        <div className="scale-label">Close</div>
                        <span className="tooltiptext">Close 50% of position</span>
                      </div>
                      <div className="scale-btn tooltip" onClick={handleScaleClick}>
                        <div className="scale-value">75%</div>
                        <div className="scale-label">Close</div>
                        <span className="tooltiptext">Close 75% of position</span>
                      </div>
                      <div className="scale-btn tooltip" onClick={handleScaleClick}>
                        <div className="scale-value">100%</div>
                        <div className="scale-label">Close</div>
                        <span className="tooltiptext">Close entire position</span>
                      </div>
                    </div>
                    <div className="position-actions">
                      <div className="position-source">
                        <div className="trader-avatar" style={{ width: '20px', height: '20px', backgroundColor: '#3fb950', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', fontWeight: '600' }}>
                          SN
                        </div>
                        <span>{trade.user}</span>
                      </div>
                      <div className="position-buttons">
                        <button className="btn btn-warning">Adjust Stop</button>
                        <button className="btn btn-danger">Close All</button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 7H13V9H11V7ZM11 11H13V17H11V11ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#8957E5"/>
                </svg>
                AI Insights & Trade Opportunities
              </h2>
              <div className="card-actions">
                <button className="btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
                  </svg>
                  Refresh
                </button>
                <button className="btn btn-success">Execute All</button>
              </div>
            </div>
            <div className="tabs">
              <div className="tab active" onClick={handleTabClick}>High Confidence</div>
              <div className="tab" onClick={handleTabClick}>All Insights</div>
              <div className="tab" onClick={handleTabClick}>By Source</div>
            </div>
            <div className="insight-grid">
              {dashboardData.insights.map((insight, index) => (
                <div key={index} className={`insight-card ${insight.summary.toLowerCase().includes('bullish') ? 'bullish' : insight.summary.toLowerCase().includes('bearish') ? 'bearish' : ''}`}>
                  <div className="insight-header">
                    <div className="insight-title">{insight.title}</div>
                    <div className="insight-meta">
                      <div className="insight-source">
                        <span className="source-icon">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5V7.5L16 12L10 16.5Z" fill={insight.summary.toLowerCase().includes('bullish') ? '#3FB950' : insight.summary.toLowerCase().includes('bearish') ? '#F85149' : '#8B949E'}/>
                          </svg>
                        </span>
                        {insight.source || 'Unknown'} + Discord
                      </div>
                      <div className="insight-time">{insight.timestamp.split(' ')[1]}</div>
                    </div>
                  </div>
                  <div className="insight-content">
                    {insight.summary}
                  </div>
                  <div className="insight-actions">
                    <div>
                      <span className="insight-tag">AI Confidence: {(Math.random() * 15 + 80).toFixed(0)}%</span>
                    </div>
                    <button className="btn btn-primary">Execute</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="#3FB950"/>
                </svg>
                TradeSync Performance
              </h2>
              <div className="card-actions">
                <div className="toggle-group">
                  <button className="toggle-btn active" onClick={handleToggleClick}>Week</button>
                  <button className="toggle-btn" onClick={handleToggleClick}>Month</button>
                  <button className="toggle-btn" onClick={handleToggleClick}>All Time</button>
                </div>
              </div>
            </div>
            <div className="performance-grid">
              <div className="performance-card">
                <div className="performance-value positive">+31.4%</div>
                <div className="performance-label">Total Return</div>
              </div>
              <div className="performance-card">
                <div className="performance-value">78%</div>
                <div className="performance-label">Win Rate</div>
              </div>
              <div className="performance-card">
                <div className="performance-value">2.4</div>
                <div className="performance-label">Avg. Risk/Reward</div>
              </div>
            </div>
            <div className="chart-container">
              <canvas id="performanceChart"></canvas>
            </div>
            <div className="tabs" style={{ marginTop: '1rem' }}>
              <div className="tab active" onClick={handleTabClick}>Recent Trades</div>
              <div className="tab" onClick={handleTabClick}>By Source</div>
              <div className="tab" onClick={handleTabClick}>By Strategy</div>
            </div>
            <div className="trade-list">
              {dashboardData.trades.map((trade, index) => (
                <div key={index} className={`trade-item ${trade.price > (trade.closed_timestamp ? parseFloat(trade.closed_timestamp.split(',').pop()) : 0) ? 'profit' : 'loss'}`}>
                  <div className="trade-header">
                    <div className="trade-title">{trade.symbol} {trade.option_details}</div>
                    <div className={`trade-result ${trade.price > (trade.closed_timestamp ? parseFloat(trade.closed_timestamp.split(',').pop()) : 0) ? 'positive' : 'negative'}`}>
                      {((trade.price / (trade.closed_timestamp ? parseFloat(trade.closed_timestamp.split(',').pop()) : trade.price) - 1) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="trade-details">
                    <div className="trade-entry">Entry: {trade.price}</div>
                    <div className="trade-exit">Exit: {trade.closed_timestamp ? trade.closed_timestamp.split(',')[1] : '-'}</div>
                  </div>
                  <div className="trade-footer">
                    <div className="trade-source">Source: {trade.user}</div>
                    <div className="trade-date">{trade.timestamp.split(' ')[0]} - {trade.closed_timestamp ? trade.closed_timestamp.split(' ')[0] : '-'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sidebar">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06C19.09 10.76 19.03 10.46 18.95 10.17L20.68 8.99C20.81 8.89 20.85 8.7 20.76 8.54L18.91 5.46C18.82 5.29 18.64 5.21 18.47 5.28L16.48 6.1C16.01 5.73 15.51 5.42 14.95 5.19L14.58 3.09C14.55 2.9 14.39 2.75 14.2 2.75H10.8C10.61 2.75 10.45 2.9 10.42 3.09L10.05 5.19C9.49 5.42 8.99 5.73 8.52 6.1L6.53 5.28C6.35 5.21 6.17 5.29 6.09 5.46L4.24 8.54C4.15 8.7 4.19 8.89 4.32 8.99L6.05 10.17C5.97 10.46 5.91 10.76 5.87 11.06C5.83 11.36 5.8 11.67 5.8 12C5.8 12.33 5.82 12.64 5.87 12.94C5.91 13.24 5.97 13.54 6.05 13.83L4.32 15.01C4.19 15.11 4.15 15.3 4.24 15.46L6.09 18.54C6.18 18.7 6.36 18.78 6.53 18.72L8.52 17.9C8.99 18.27 9.49 18.58 10.05 18.81L10.42 20.91C10.45 21.1 10.61 21.25 10.8 21.25H14.2C14.39 21.25 14.55 21.1 14.58 20.91L14.95 18.81C15.51 18.58 16.01 18.27 16.48 17.9L18.47 18.72C18.65 18.79 18.83 18.7 18.91 18.54L20.76 15.46C20.85 15.3 20.81 15.11 20.68 15.01L18.95 13.83C19.03 13.54 19.09 13.24 19.14 12.94ZM12.5 15.5C10.57 15.5 9 13.93 9 12C9 10.07 10.57 8.5 12.5 8.5C14.43 8.5 16 10.07 16 12C16 13.93 14.43 15.5 12.5 15.5Z" fill="#F85149"/>
                </svg>
                Trading Settings <span className="badge badge-active">Active</span>
              </h2>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>Alpaca API Connected</div>
              <label className="switch">
                <input type="checkbox" checked />
                <span className="slider"></span>
              </label>
            </div>
            <div className="settings-list">
              <div className="settings-item">
                <div className="settings-label">Position Sizing</div>
                <div className="settings-value">Dynamic (5% max)</div>
              </div>
              <div className="settings-item">
                <div className="settings-label">Entry Timing</div>
                <div className="settings-value">Volume-based</div>
              </div>
              <div className="settings-item">
                <div className="settings-label">Stop Loss</div>
                <div className="settings-value">Auto (from source)</div>
              </div>
              <div className="settings-item">
                <div className="settings-label">Take Profit</div>
                <div className="settings-value">Tiered (50%, 75%, 100%)</div>
              </div>
              <div className="settings-item">
                <div className="settings-label">AI Confidence Threshold</div>
                <div className="settings-value">75%</div>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button className="btn" style={{ width: '100%' }}>Advanced Settings</button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 7H13V9H11V7ZM11 11H13V17H11V11ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#8957E5"/>
                </svg>
                AI Performance Analytics
              </h2>
            </div>
            <div className="ai-metric">
              <div className="ai-metric-label">Source Reliability Score</div>
              <div className="ai-metric-value">8.7/10</div>
              <div className="progress-bar green" style={{ '--width': '87%' }}></div>
            </div>
            <div className="ai-metric">
              <div className="ai-metric-label">Execution Accuracy</div>
              <div className="ai-metric-value">9.1/10</div>
              <div className="progress-bar green" style={{ '--width': '91%' }}></div>
            </div>
            <div className="ai-metric">
              <div className="ai-metric-label">Market Trend Analysis</div>
              <div className="ai-metric-value">8.4/10</div>
              <div className="progress-bar green" style={{ '--width': '84%' }}></div>
            </div>
            <div className="ai-metric">
              <div className="ai-metric-label">Risk Management</div>
              <div className="ai-metric-value">9.3/10</div>
              <div className="progress-bar green" style={{ '--width': '93%' }}></div>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.875rem' }}>Top Performing Sources</div>
              <div className="top-insights">
                <div className="insight-item">
                  <div className="insight-icon" style={{ backgroundColor: '#3fb950' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5V7.5L16 12L10 16.5Z" fill="white"/>
                    </svg>
                  </div>
                  <div className="insight-item-content">
                    <div className="insight-item-title">ManzTrades</div>
                    <div className="insight-item-desc">82% Win Rate • 2.2 Risk/Reward</div>
                  </div>
                </div>
                <div className="insight-item">
                  <div className="insight-icon" style={{ backgroundColor: '#388bfd' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="white"/>
                      <path d="M10 16.5L16 12L10 7.5V16.5Z" fill="white"/>
                    </svg>
                  </div>
                  <div className="insight-item-content">
                    <div className="insight-item-title">APlusOptions</div>
                    <div className="insight-item-desc">76% Win Rate • 2.5 Risk/Reward</div>
                  </div>
                </div>
                <div className="insight-item">
                  <div className="insight-icon" style={{ backgroundColor: '#db6d28' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 3H14.82C14.4 1.84 13.3 1 12 1C10.7 1 9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM12 3C12.55 3 13 3.45 13 4C13 4.55 12.55 5 12 5C11.45 5 11 4.55 11 4C11 3.45 11.45 3 12 3ZM14 17H7V15H14V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z" fill="white"/>
                    </svg>
                  </div>
                  <div className="insight-item-content">
                    <div className="insight-item-title">MarketWise</div>
                    <div className="insight-item-desc">71% Win Rate • 1.9 Risk/Reward</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.875rem' }}>Trading Strategy Performance</div>
              <div className="strategy-grid">
                <div className="strategy-card best">
                  <div className="strategy-name">Momentum</div>
                  <div className="strategy-value positive">+42.3%</div>
                </div>
                <div className="strategy-card">
                  <div className="strategy-name">Swing</div>
                  <div className="strategy-value positive">+28.7%</div>
                </div>
                <div className="strategy-card">
                  <div className="strategy-name">Earnings</div>
                  <div className="strategy-value positive">+19.5%</div>
                </div>
                <div className="strategy-card">
                  <div className="strategy-name">Hedging</div>
                  <div className="strategy-value positive">+12.2%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;