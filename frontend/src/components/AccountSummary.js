import React from 'react';
import './AccountSummary.css';

const AccountSummary = ({ metrics, isPaperTrading }) => {
  console.log('AccountSummary.js: Rendering AccountSummary component, metrics=', metrics, 'isPaperTrading=', isPaperTrading);
  console.log('AccountSummary.js: metrics.accountValue=', metrics.accountValue, 'metrics.availableCash=', metrics.availableCash, 'metrics.totalPnl=', metrics.totalPnl, 'metrics.openPositions=', metrics.openPositions, 'metrics.winRate=', metrics.winRate);

  return (
    <div className="account-summary">
      <div className="account-summary-title">
        <h2>Account Summary</h2>
        <span className={`account-type ${isPaperTrading ? 'paper-trading' : 'live-trading'}`}>
          {isPaperTrading ? 'Paper Trading' : 'Live Trading'}
        </span>
      </div>
      
      <div className="metric-card">
        <div className="metric-name">Account Value</div>
        <div className="metric-value">${metrics.accountValue?.toLocaleString() || 0}</div>
      </div>
      
      <div className="metric-card">
        <div className="metric-name">Available Cash</div>
        <div className="metric-value">${metrics.availableCash?.toLocaleString() || 0}</div>
      </div>
      
      <div className="metric-card">
        <div className="metric-name">Total P&L</div>
        <div className={`metric-value ${metrics.totalPnl >= 0 ? 'positive' : 'negative'}`}>
          ${metrics.totalPnl?.toLocaleString() || 0}
        </div>
      </div>
      
      <div className="metric-card">
        <div className="metric-name">Open Positions</div>
        <div className="metric-value">{metrics.openPositions || 0}</div>
      </div>
      
      <div className="metric-card">
        <div className="metric-name">Win Rate</div>
        <div className="metric-value">
          {metrics.winRate || 0}<span className="metric-percent">%</span>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;
