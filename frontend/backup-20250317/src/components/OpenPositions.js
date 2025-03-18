import React from 'react';

const OpenPositions = ({ positions }) => {
  // Ensure positions is always an array
  const posArray = Array.isArray(positions) ? positions : [];
  
  return (
    <div className="open-positions">
      <div className="header">
        <h2>Open Positions</h2>
        <button className="new-trade">New Trade</button>
      </div>
      
      {posArray.length > 0 ? (
        posArray.map((pos, index) => (
          <div key={index} className={`position-card ${pos.pl >= 0 ? 'positive' : 'negative'}`}>
            <div className="position-header">
              <div className={`position-type ${pos.type === 'option' ? 'option' : 'stock'}`}>
                {pos.type === 'option' ? `${pos.symbol} 490C ${pos.expiration}` : `${pos.symbol} Stock`}
              </div>
              <button className="action-button">
                <span></span>
              </button>
            </div>
            
            <div className="position-details">
              <div className="detail-group">
                <span className="detail-label">Quantity</span>
                <span className="detail-value">{pos.quantity}</span>
              </div>
              <div className="detail-group">
                <span className="detail-label">Entry Price</span>
                <span className="detail-value">${pos.entryPrice.toFixed(2)}</span>
              </div>
              <div className="detail-group">
                <span className="detail-label">Current Price</span>
                <span className="detail-value">${pos.currentPrice.toFixed(2)}</span>
              </div>
              <div className="detail-group">
                <span className="detail-label">Cost Basis</span>
                <span className="detail-value">${pos.costBasis.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}</span>
              </div>
              <div className="detail-group">
                <span className="detail-label">P/L ($)</span>
                <span className={`detail-value ${pos.pl >= 0 ? 'positive' : 'negative'}`}>
                  {pos.pl >= 0 ? '+' : ''}{pos.pl.toFixed(2)}
                </span>
              </div>
              <div className="detail-group">
                <span className="detail-label">P/L (%)</span>
                <span className={`detail-value ${pos.plPercent >= 0 ? 'positive' : 'negative'}`}>
                  {pos.plPercent >= 0 ? '+' : ''}{pos.plPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="no-positions">No open positions</div>
      )}
    </div>
  );
};

export default OpenPositions;
