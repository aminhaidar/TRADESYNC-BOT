import React from 'react';
import './Insights.css';
import { useSocket } from '../context/SocketContext';

const Insights = ({ insights, activeTab }) => {
  const { socket, isConnected } = useSocket();

  const handleExecute = (insight) => {
    if (socket && isConnected) {
      socket.emit('execute_trade', {
        symbol: insight.symbol || 'AAPL',
        action: insight.recommendation?.toLowerCase() || 'buy',
        confidence: insight.confidence || 0.85,
      });
      console.log('Sent execute_trade event:', { 
        symbol: insight.symbol, 
        action: insight.recommendation?.toLowerCase() || 'buy', 
        confidence: insight.confidence 
      });
    } else {
      console.warn('Cannot execute trade: Socket is not connected');
    }
  };

  const filteredInsights = insights.filter(insight =>
    activeTab === 'all' || insight.category === activeTab
  );

  return (
    <div className="insights-container">
      <h2>Insights</h2>
      <div className="insights-list">
        {filteredInsights.length > 0 ? (
          filteredInsights.map((insight, index) => (
            <div key={index} className="insight-card">
              <div className="insight-header">
                <h3>{insight.symbol || 'N/A'}</h3>
                <span className={`insight-recommendation ${insight.recommendation?.toLowerCase()}`}>
                  {insight.recommendation || 'No recommendation'}
                </span>
              </div>
              <div className="insight-content">
                <p>{insight.summary || 'No recommendation available'}</p>
              </div>
              <div className="insight-footer">
                <div className="insight-tags">
                  <span className="insight-tag">AI Confidence: {((insight.confidence || 0) * 100).toFixed(0)}%</span>
                  <span className="insight-tag">Short-term</span>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleExecute(insight)}
                  disabled={!isConnected}
                >
                  Execute {!isConnected && '(Offline)'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-insights">No insights available for this tab.</div>
        )}
      </div>
    </div>
  );
};

export default Insights;
