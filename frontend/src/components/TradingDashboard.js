import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import AccountSummary from './AccountSummary';
import PositionsList from './PositionsList';
import Chart from './Chart';
import AIInsightsSection from './AIInsightsSection';
import MarketTicker from './MarketTicker';
import './TradingDashboard.css';

const TradingDashboard = ({ dashboardData, refreshData, isPaperTrading = true }) => {
  const { isConnected } = useSocket();
  const [chartData, setChartData] = useState(null);
  const [activeTab, setActiveTab] = useState('actionable');

  useEffect(() => {
    console.log('TradingDashboard: Component mounted or updated');
    if (dashboardData && dashboardData.chartData) {
      setChartData(dashboardData.chartData);
    }
  }, [dashboardData]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="trading-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="app-title">Trade<span className="accent">Sync</span> <span className="version">Beta</span></h1>
          <div className="environment-badge">{isPaperTrading ? 'Paper Trading' : 'Live Trading'}</div>
        </div>
        <div className="header-right">
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </header>

      <MarketTicker />
      
      {/* Three-column layout */}
      <div className="dashboard-main">
        {/* Left column - Account & Positions */}
        <div className="dashboard-column left-column">
          <AccountSummary metrics={dashboardData?.metrics || {}} />
          <PositionsList positions={dashboardData?.positions || []} />
        </div>
        
        {/* Center column - Insights (now prominently featured) */}
        <div className="dashboard-column center-column">
          <AIInsightsSection 
            insights={dashboardData?.insights || []}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isConnected={isConnected}
            refreshData={refreshData}
          />
        </div>
        
        {/* Right column - Chart */}
        <div className="dashboard-column right-column">
          <div className="dashboard-card">
            <h2>Portfolio Performance</h2>
            {chartData ? (
              <Chart data={chartData} />
            ) : (
              <div className="no-data">No chart data available</div>
            )}
          </div>
          
          {/* Recent Trades */}
          <div className="dashboard-card recent-trades">
            <h2>Recent Trades</h2>
            {dashboardData?.trades && dashboardData.trades.length > 0 ? (
              <div className="trades-list">
                {dashboardData.trades.map((trade, index) => (
                  <div key={index} className="trade-item">
                    <div className="trade-symbol">{trade.symbol}</div>
                    <div className={`trade-action ${trade.action}`}>{trade.action.toUpperCase()}</div>
                    <div className="trade-details">
                      <div>{trade.quantity} @ ${trade.price.toFixed(2)}</div>
                      <div className="trade-option">{trade.option_details || 'Stock'}</div>
                    </div>
                    <div className="trade-status">{trade.status}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No trades yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;
