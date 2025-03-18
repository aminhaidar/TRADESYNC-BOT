import React from 'react';
import PositionCard from './PositionCard';

const PositionsList = ({ positions }) => {
  if (!positions || positions.length === 0) {
    return (
      <div className="positions-list card">
        <div className="card-header">
          <h2 className="card-title">Open Positions</h2>
        </div>
        <div className="empty-state">
          <p>No open positions found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="positions-list card">
      <div className="card-header">
        <h2 className="card-title">Open Positions</h2>
        <div className="card-actions">
          <button className="btn">Refresh</button>
        </div>
      </div>
      
      <div className="positions-container">
        {positions.map((position, index) => (
          <PositionCard key={index} position={position} />
        ))}
      </div>
    </div>
  );
};

export default PositionsList;
