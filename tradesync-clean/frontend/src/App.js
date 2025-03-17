import React, { useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

function App() {
  const { isConnected, sendMessage, lastMessage } = useSocket();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5001/api/dashboard-data');
        const data = await response.json();
        console.log('Dashboard data:', data);
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [lastMessage]); // Refetch when a new trade comes in

  // Execute a trade
  const handleExecute = (insight) => {
    console.log('Executing trade for:', insight);
    sendMessage('execute_trade', {
      symbol: insight.symbol,
      action: insight.recommendation.toLowerCase(),
      price: 190.50, // Example price
      quantity: 1,
      confidence: insight.confidence,
      source: 'AI Insight'
    });
  };

  if (isLoading) {
    return (
      <div className="tradesync-dashboard">
        <div className="sidebar">
          <div className="logo">
            TradeSync <span className="logo-bot">Bot</span>
          </div>
          <div className="nav-item active">
            <span className="nav-item-icon">📊</span> Dashboard
          </div>
          <div className="nav-item">
            <span className="nav-item-icon">📈</span> Positions
          </div>
          <div className="nav-item">
            <span className="nav-item-icon">🤖</span> AI Insights
          </div>
          <div className="nav-item">
            <span className="nav-item-icon">📜</span> Trade History
          </div>
          <div className="nav-item">
            <span className="nav-item-icon">⚙️</span> Settings
          </div>
          <div className={`connection-status ${isConnected ? 'connected' : ''}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        <div className="main-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">TradeSync Bot</h1>
            <div className="dashboard-controls">
              <button className="mode-toggle">Light Mode</button>
              <button className="btn btn-paperlive">PAPER LIVE</button>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Loading dashboard data...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tradesync-dashboard">
      <div className="sidebar">
        <div className="logo">
          TradeSync <span className="logo-bot">Bot</span>
        </div>
        <div className="nav-item active">
          <span className="nav-item-icon">📊</span> Dashboard
        </div>
        <div className="nav-item">
          <span className="nav-item-icon">📈</span> Positions
        </div>
        <div className="nav-item">
          <span className="nav-item-icon">🤖</span> AI Insights
        </div>
        <div className="nav-item">
          <span className="nav-item-icon">📜</span> Trade History
        </div>
        <div className="nav-item">
          <span className="nav-item-icon">⚙️</span> Settings
        </div>
        <div className={`connection-status ${isConnected ? 'connected' : ''}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
      <div className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">TradeSync Bot</h1>
          <div className="dashboard-controls">
            <button className="mode-toggle">Light Mode</button>
            <button className="btn btn-paperlive">PAPER LIVE</button>
          </div>
        </div>

        {dashboardData && (
          <>
            <div className="market-ticker">
              <div className="ticker-item">
                <div className="ticker-symbol">SPY</div>
                <div className="ticker-price">483.27</div>
                <div className="ticker-change positive">+0.15%</div>
              </div>
              <div className="ticker-item">
                <div className="ticker-symbol">QQQ</div>
                <div className="ticker-price">414.93</div>
                <div className="ticker-change positive">+0.17%</div>
              </div>
              <div className="ticker-item">
                <div className="ticker-symbol">VIX</div>
                <div className="ticker-price">17.28</div>
                <div className="ticker-change negative">-5.36%</div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-header">Account Summary</div>
                <div className="card-content">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <div style={{ color: 'var(--text-secondary)' }}>Account Value</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${dashboardData.metrics.accountValue.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-secondary)' }}>Available Cash</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${dashboardData.metrics.availableCash.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-secondary)' }}>P&L</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>+${dashboardData.metrics.totalPnl.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-secondary)' }}>Win Rate</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{dashboardData.metrics.winRate}%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">AI Trading Insights</div>
                <div className="card-content">
                  {dashboardData.insights.slice(0, 3).map((insight, index) => (
                    <div key={index} style={{ 
                      padding: '10px', 
                      marginBottom: '10px', 
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{insight.symbol}</div>
                        <div style={{ 
                          color: insight.recommendation === 'Buy' ? 'var(--primary-color)' : 
                                 insight.recommendation === 'Sell' ? 'var(--danger-color)' : 'var(--text-secondary)'
                        }}>
                          {insight.recommendation}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {insight.confidence * 100}% confidence
                        </div>
                      </div>
                      <button 
                        onClick={() => handleExecute(insight)} 
                        style={{ 
                          backgroundColor: 'var(--primary-color)', 
                          color: '#000',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Execute
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">Open Positions</div>
                <div className="card-content">
                  {dashboardData.positions.length > 0 ? (
                    dashboardData.positions.map((position, index) => (
                      <div key={index} style={{ 
                        padding: '10px', 
                        marginBottom: '10px', 
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{position.symbol}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {position.quantity} @ ${position.avgPrice.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div>${position.currentPrice.toFixed(2)}</div>
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: position.pnl >= 0 ? 'var(--primary-color)' : 'var(--danger-color)'
                          }}>
                            {position.pnl >= 0 ? '+' : ''}{position.pnl.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                      No open positions
                    </div>
                  )}
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">Recent Trades</div>
                <div className="card-content">
                  {dashboardData.trades.length > 0 ? (
                    dashboardData.trades.map((trade, index) => (
                      <div key={index} style={{ 
                        padding: '10px', 
                        marginBottom: '10px', 
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ 
                            fontWeight: 'bold',
                            color: trade.action === 'buy' ? 'var(--primary-color)' : 'var(--danger-color)'
                          }}>
                            {trade.action.toUpperCase()} {trade.symbol}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {trade.quantity} @ ${trade.price.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div>{trade.status}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {new Date(trade.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                      No recent trades
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
