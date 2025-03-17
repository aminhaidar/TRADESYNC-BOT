import React from 'react';

const AccountSummary = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="card account-summary">
        <div className="card-header">
          <h2 className="card-title">Account Summary</h2>
        </div>
        <div className="loading-placeholder">Loading account data...</div>
      </div>
    );
  }

  const { accountValue, availableCash, totalPnl, openPositions, winRate } = metrics;
  const isPnlPositive = totalPnl >= 0;

  return (
    <div className="card account-summary">
      <div className="card-header">
        <h2 className="card-title">Account Summary</h2>
      </div>
      
      <div className="summary-grid">
        <div className="summary-item">
          <div className="item-label">Account Value</div>
          <div className="item-value">
            ${accountValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="summary-item">
          <div className="item-label">Available Cash</div>
          <div className="item-value">
            ${availableCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="summary-item">
          <div className="item-label">Total P&L</div>
          <div className={`item-value ${isPnlPositive ? 'positive' : 'negative'}`}>
            ${Math.abs(totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            {isPnlPositive ? ' ▲' : ' ▼'}
          </div>
        </div>
        
        <div className="summary-item">
          <div className="item-label">Open Positions</div>
          <div className="item-value">{openPositions}</div>
        </div>
        
        <div className="summary-item">
          <div className="item-label">Win Rate</div>
          <div className="item-value">{winRate}%</div>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;
