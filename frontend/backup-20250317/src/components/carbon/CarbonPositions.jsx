import React, { useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import './CarbonPositions.scss';

const CarbonPositions = () => {
  const { positions } = useSocket();
  const [expandedPositions, setExpandedPositions] = useState({});

  const togglePosition = (id) => {
    setExpandedPositions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Mock positions if none are received yet
  const mockPositions = [
    {
      id: 'aapl-stock',
      type: 'stock',
      symbol: 'AAPL',
      quantity: 10,
      entryPrice: 211.80,
      currentPrice: 211.54,
      costBasis: 2118.00,
      plValue: 171.37,
      plPercent: 8.0,
      dayChange: 0.8,
      isProfit: true
    },
    {
      id: 'tsla-stock',
      type: 'stock',
      symbol: 'TSLA',
      quantity: 15,
      entryPrice: 180.50,
      currentPrice: 177.46,
      costBasis: 2707.50,
      plValue: -39.60,
      plPercent: -1.6,
      dayChange: -0.5,
      isProfit: false
    },
    {
      id: 'spy-options',
      type: 'option',
      symbol: 'SPY 490C 03/29/25',
      quantity: 5,
      entryPrice: 4.30,
      currentPrice: 4.85,
      costBasis: 2150.00,
      plValue: 274.13,
      plPercent: 12.8,
      dayChange: 1.2,
      isProfit: true
    }
  ];
  
  const displayPositions = positions.length > 0 ? positions : mockPositions;

  return (
    <div className="positions-container">
      <div className="section-header">
        <h2>Open Positions</h2>
        <button className="new-trade-btn">New Trade</button>
      </div>

      <div className="positions-list">
        {displayPositions.map((position) => (
          <div 
            key={position.id} 
            className={`position-item ${position.isProfit ? 'profit' : 'loss'}`}
          >
            <div className="position-header" onClick={() => togglePosition(position.id)}>
              <div className="position-tag">
                {position.type === 'option' ? 
                  <span className="tag option">{position.symbol}</span> :
                  <span className="tag stock">{position.symbol} Stock</span>
                }
              </div>
              
              <div className="position-details">
                <div className="detail">
                  <span className="label">Quantity</span>
                  <span className="value">{position.quantity}</span>
                </div>
                <div className="detail">
                  <span className="label">Entry Price</span>
                  <span className="value">${position.entryPrice.toFixed(2)}</span>
                </div>
                <div className="detail">
                  <span className="label">Current Price</span>
                  <span className="value">${position.currentPrice.toFixed(2)}</span>
                </div>
                <div className="detail">
                  <span className="label">Cost Basis</span>
                  <span className="value">${position.costBasis.toFixed(2)}</span>
                </div>
                <div className="detail">
                  <span className="label">P/L ($)</span>
                  <span className={`value ${position.isProfit ? 'positive' : 'negative'}`}>
                    {position.isProfit ? '+' : ''}{position.plValue.toFixed(2)}
                  </span>
                </div>
                <div className="detail">
                  <span className="label">P/L (%)</span>
                  <span className={`value ${position.isProfit ? 'positive' : 'negative'}`}>
                    {position.isProfit ? '+' : ''}{position.plPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="detail">
                  <span className="label">Day's P/L</span>
                  <span className={`value ${position.dayChange >= 0 ? 'positive' : 'negative'}`}>
                    {position.dayChange >= 0 ? '+' : ''}{position.dayChange.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="position-actions">
                <button className="action-btn">
                  <span className={`arrow ${expandedPositions[position.id] ? 'up' : 'down'}`}></span>
                </button>
              </div>
            </div>
            
            {expandedPositions[position.id] && (
              <div className="position-expanded">
                <div className="action-buttons">
                  <button className="btn btn-success">Buy More</button>
                  <button className="btn btn-outline-danger">Sell Position</button>
                  <button className="btn">View Details</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarbonPositions;
