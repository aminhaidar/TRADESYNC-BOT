import React from 'react';

const PositionsList = ({ positions }) => {
  console.log('PositionsList.js: Rendering PositionsList component, positions=', positions);
  console.log('PositionsList.js: positions.length=', positions.length);

  return (
    <div className="positions-list">
      <h2>Positions</h2>
      {positions.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Avg Price</th>
              <th>Current Price</th>
              <th>P&L</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position, index) => (
              <tr key={index}>
                <td>{position.symbol}</td>
                <td>{position.quantity}</td>
                <td>${position.avgPrice?.toFixed(2)}</td>
                <td>${position.currentPrice?.toFixed(2)}</td>
                <td className={position.pnl >= 0 ? 'positive' : 'negative'}>
                  ${position.pnl?.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No open positions.</div>
      )}
    </div>
  );
};

export default PositionsList; // Use default export
