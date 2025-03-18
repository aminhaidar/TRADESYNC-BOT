import React from 'react';
import { useSocket } from '../../contexts/SocketContext';
import './CarbonAccountSummary.scss';

const CarbonAccountSummary = () => {
  const { accountSummary } = useSocket();
  
  // Mock data for initial rendering
  const defaultData = {
    totalValue: 52478.54,
    availableCash: 37888.382,
    openPL: 511.762,
    closedPL: 776.78
  };
  
  const data = accountSummary || defaultData;

  return (
    <div className="account-summary">
      <div className="section-header">
        <h2>Account Summary</h2>
      </div>
      
      <div className="account-value-section">
        <div className="value-label">Total Value</div>
        <div className="value-amount">
          ${data.totalValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </div>
      </div>

      <div className="account-details">
        <div className="detail-item bg-element">
          <div className="detail-label">Available Cash</div>
          <div className="detail-value">
            ${data.availableCash.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-item bg-element">
            <div className="detail-label">Open P/L</div>
            <div className={`detail-value ${data.openPL >= 0 ? 'positive' : 'negative'}`}>
              {data.openPL >= 0 ? '+' : ''}${Math.abs(data.openPL).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          </div>

          <div className="detail-item bg-element">
            <div className="detail-label">Closed P/L</div>
            <div className={`detail-value ${data.closedPL >= 0 ? 'positive' : 'negative'}`}>
              {data.closedPL >= 0 ? '+' : ''}${Math.abs(data.closedPL).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonAccountSummary;
