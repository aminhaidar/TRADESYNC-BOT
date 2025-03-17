import React, { useState } from 'react';
import ScaleButtons from './ScaleButtons';

const PositionCard = ({ position }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Extract data from position
  const { 
    symbol, 
    quantity,
    avgPrice, 
    currentPrice, 
    pnl
  } = position;
  
  // Calculate percent change
  const percentChange = ((currentPrice - avgPrice) / avgPrice * 100).toFixed(2);
  const isProfit = pnl >= 0;
  
  // Option details (mocked for now)
  const optionDetails = '155C 04/17';
  
  const handleToggle = () => {
    setExpanded(!expanded);
  };
  
  const handleScaleOut = (percentage) => {
    console.log(`Scaling out ${percentage}% of ${symbol}`);
    // Implement scale out logic
  };
  
  const handleCloseAll = () => {
    console.log(`Closing all ${symbol} positions`);
    // Implement close all logic
  };
  
  return (
    <div className={`position-card ${expanded ? 'expanded' : ''}`}>
      <div className="position-header" onClick={handleToggle}>
        <div className="position-info">
          <div className="position-title">
            <span className="position-symbol">{symbol}</span>
            <span className="position-details">{optionDetails}</span>
          </div>
          <div className="position-change">
            <span className={`percent-change ${isProfit ? 'positive' : 'negative'}`}>
              {isProfit ? '+' : ''}{percentChange}%
            </span>
          </div>
        </div>
        
        <div className="position-data">
          <div className="position-quantity">
            {quantity} contracts @ ${avgPrice.toFixed(2)}
          </div>
          <div className="position-price">
            ${currentPrice.toFixed(2)}
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="position-expanded">
          <div className="position-actions">
            <ScaleButtons onScale={handleScaleOut} />
            
            <div className="action-buttons">
              <button className="btn btn-warning">Adjust Stop</button>
              <button className="btn btn-danger" onClick={handleCloseAll}>
                Close All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionCard;
