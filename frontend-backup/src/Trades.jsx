import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';

function Trades({ socket }) {
  const [trades, setTrades] = useState([]);
  const [alerts, setAlerts] = useState([
    {
      id: 'welcome',
      type: 'info',
      title: 'Welcome to TradeSync!',
      message: 'Configure your trade alerts to receive notifications about market opportunities.',
      actions: [{ label: 'Set Up Alerts', type: 'primary' }],
    },
  ]);
  const [marketData, setMarketData] = useState({});

  useEffect(() => {
    // Fetch initial trades
    fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/trades`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => setTrades(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(error => {
        console.error('Error fetching trades:', error);
        setTrades([]);
      });

    // Listen for live trade updates
    socket.on('live_trade_update', (trade) => {
      setTrades(prev => [
        {
          symbol: trade.symbol || 'N/A',
          action: trade.action || 'unknown',
          quantity: trade.quantity || 1,
          price: trade.price || 0.0,
          status: trade.status || 'pending',
          timestamp: trade.timestamp || new Date().toISOString(),
          confidence: trade.confidence || 0.75,
        },
        ...prev,
      ].slice(0, 5));

      setAlerts(prev => [
        {
          id: Date.now().toString(),
          type: trade.action === 'buy' ? 'success' : 'danger',
          title: `${trade.action === 'buy' ? 'Momentum Alert' : 'Bearish Signal'}: ${trade.symbol}`,
          message: trade.action === 'buy'
            ? `${trade.symbol} shows strong upward momentum. Confidence: ${(trade.confidence * 100).toFixed(1)}%.`
            : `${trade.symbol} indicates a bearish pattern. Confidence: ${(trade.confidence * 100).toFixed(1)}%.`,
          meta: [
            { icon: 'fas fa-chart-line', text: `Price: $${trade.price || 0.0}` },
            { icon: 'fas fa-calendar', text: new Date(trade.timestamp).toLocaleDateString() },
            { icon: 'fas fa-signal', text: `Confidence: ${(trade.confidence * 100).toFixed(1)}%` },
          ],
          actions: [
            { label: 'Execute', type: trade.action === 'buy' ? 'success' : 'danger' },
            { label: 'Analyze', type: 'outline' },
            { label: 'Dismiss', type: 'outline' },
          ],
        },
        ...prev,
      ].slice(0, 5));
    });

    // Listen for market data updates
    socket.on('indices_update', (indices) => {
      setMarketData(indices);
    });

    return () => {
      socket.off('live_trade_update');
      socket.off('indices_update');
    };
  }, [socket]);

  const handleAlertAction = (alertId, action) => {
    if (action === 'Dismiss') {
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } else {
      console.log(`Action ${action} for alert ${alertId}`);
    }
  };

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const getOrderStatusClass = (status) => {
    if (!status) return 'pending';
    switch (status.toLowerCase()) {
      case 'filled': return 'filled';
      case 'canceled': case 'expired': case 'rejected': case 'not_traded': return 'canceled';
      case 'partially_filled': return 'partial';
      default: return 'pending';
    }
  };

  return (
    <ErrorBoundary>
      <>
        {/* Market Overview */}
        <div className="card fade-in mb-4">
          <div className="card-header">
            <h2 className="card-title">
              <i className="fas fa-chart-line"></i> Market Overview
            </h2>
          </div>
          <div className="card-body">
            <div className="market-indices">
              {marketData.SPX && (
                <div className="index-card">
                  <div className="index-name">SPX</div>
                  <div className="index-value">${marketData.SPX.price.toLocaleString()}</div>
                  <div className={`index-change ${marketData.SPX.change >= 0 ? 'text-success' : 'text-danger'}`}>
                    <i className={marketData.SPX.change >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'}></i>
                    {marketData.SPX.change}%
                  </div>
                </div>
              )}
              {marketData.QQQ && (
                <div className="index-card">
                  <div className="index-name">QQQ</div>
                  <div className="index-value">${marketData.QQQ.price.toLocaleString()}</div>
                  <div className={`index-change ${marketData.QQQ.change >= 0 ? 'text-success' : 'text-danger'}`}>
                    <i className={marketData.QQQ.change >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'}></i>
                    {marketData.QQQ.change}%
                  </div>
                </div>
              )}
              {marketData.VIX && (
                <div className="index-card">
                  <div className="index-name">VIX</div>
                  <div className="index-value">{marketData.VIX.price}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="card fade-in">
          <div className="card-header">
            <h2 className="card-title">
              <i className="fas fa-exchange-alt"></i> Recent Orders
            </h2>
            <div className="card-actions">
              <div className="badge badge-outline">Last 5 orders</div>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Symbol</th>
                    <th>Side</th>
                    <th>Type</th>
                    <th className="text-right">Quantity</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Confidence</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody id="orders-table">
                  {trades.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-secondary">
                        <i className="fas fa-info-circle text-lg mb-2"></i>
                        <div>No trades available</div>
                      </td>
                    </tr>
                  ) : (
                    trades.map((trade, index) => (
                      <tr key={index}>
                        <td>{new Date(trade.timestamp).toLocaleDateString()}</td>
                        <td>
                          <div className="symbol-cell">
                            <div className="symbol-icon">{trade.symbol.substring(0, 2)}</div>
                            <div className="symbol-text">{trade.symbol}</div>
                          </div>
                        </td>
                        <td>
                          <div className={`order-side ${trade.action}`}>
                            {trade.action.toUpperCase()}
                          </div>
                        </td>
                        <td>Market</td>
                        <td className="text-right">{trade.quantity}</td>
                        <td className="text-right">{formatCurrency(trade.price)}</td>
                        <td className="text-right">{(trade.confidence * 100).toFixed(1)}%</td>
                        <td className="text-center">
                          <div className={`order-status ${getOrderStatusClass(trade.status)}`}>
                            {trade.status.toUpperCase()}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Trade Alerts */}
        <div className="card fade-in">
          <div className="card-header">
            <h2 className="card-title">
              <i className="fas fa-bell"></i> Trade Alerts
            </h2>
            <div className="card-actions">
              <button className="btn btn-sm btn-outline">
                <i className="fas fa-cog mr-1"></i> Configure
              </button>
            </div>
          </div>
          <div className="card-body">
            <div id="alerts-container">
              {alerts.length === 0 ? (
                <div className="text-center text-secondary">
                  <i className="fas fa-bell-slash text-lg mb-2"></i>
                  <div>No trade alerts available</div>
                </div>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} className={`alert alert-${alert.type}`}>
                    <div
                      className="alert-icon"
                      style={{
                        backgroundColor: `rgba(${
                          alert.type === 'success' ? '16,185,129' :
                          alert.type === 'danger' ? '239,68,68' :
                          '14,165,233'
                        },0.1)`,
                        color: `var(--color-${alert.type})`,
                      }}
                    >
                      <i className="fas fa-info-circle"></i>
                    </div>
                    <div className="alert-content">
                      <div className="alert-title">{alert.title}</div>
                      <p className="alert-message">{alert.message}</p>
                      {alert.meta && (
                        <div className="trade-alert-meta">
                          {alert.meta.map((item, idx) => (
                            <div key={idx} className="trade-alert-meta-item">
                              <i className={item.icon}></i> {item.text}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="alert-actions">
                        {alert.actions.map((action, idx) => (
                          <button
                            key={idx}
                            className={`btn btn-sm btn-${action.type}`}
                            onClick={() => handleAlertAction(alert.id, action.label)}
                          >
                            {action.label === 'Execute' && <i className="fas fa-play mr-1"></i>}
                            {action.label === 'Analyze' && <i className="fas fa-chart-bar mr-1"></i>}
                            {action.label === 'Dismiss' && <i className="fas fa-times mr-1"></i>}
                            {action.label === 'Set Up Alerts' && <i className="fas fa-bell mr-1"></i>}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </>
    </ErrorBoundary>
  );
}

export default Trades;