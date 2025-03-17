import React from 'react';
import '../styles/AIAnalytics.css';

export const AIAnalytics = () => {
  return (
    <div className="ai-analytics-card">
      <div className="card-header">
        <h2 className="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 7H13V9H11V7ZM11 11H13V17H11V11ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="var(--accent-purple)"/>
          </svg>
          AI Performance Analytics
        </h2>
      </div>
      
      <div className="ai-metrics">
        <div className="ai-metric">
          <div className="ai-metric-label">Source Reliability Score</div>
          <div className="ai-metric-value">8.7/10</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '87%' }}></div>
          </div>
        </div>
        
        <div className="ai-metric">
          <div className="ai-metric-label">Execution Accuracy</div>
          <div className="ai-metric-value">9.1/10</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '91%' }}></div>
          </div>
        </div>
        
        <div className="ai-metric">
          <div className="ai-metric-label">Market Trend Analysis</div>
          <div className="ai-metric-value">8.4/10</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '84%' }}></div>
          </div>
        </div>
        
        <div className="ai-metric">
          <div className="ai-metric-label">Risk Management</div>
          <div className="ai-metric-value">9.3/10</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '93%' }}></div>
          </div>
        </div>
      </div>
      
      <div className="top-sources">
        <h3 className="section-title">Top Performing Sources</h3>
        <div className="source-list">
          <div className="source-item">
            <div className="source-avatar" style={{ backgroundColor: "var(--accent-green)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5V7.5L16 12L10 16.5Z" fill="white"/>
              </svg>
            </div>
            <div className="source-content">
              <div className="source-name">ManzTrades</div>
              <div className="source-stats">82% Win Rate • 2.2 Risk/Reward</div>
            </div>
          </div>
          
          <div className="source-item">
            <div className="source-avatar" style={{ backgroundColor: "var(--accent-blue)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="white"/>
              </svg>
            </div>
            <div className="source-content">
              <div className="source-name">APlusOptions</div>
              <div className="source-stats">76% Win Rate • 2.5 Risk/Reward</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="strategy-performance">
        <h3 className="section-title">Trading Strategy Performance</h3>
        <div className="strategy-grid">
          <div className="strategy-card best">
            <div className="strategy-name">Momentum</div>
            <div className="strategy-value positive">+42.3%</div>
          </div>
          <div className="strategy-card">
            <div className="strategy-name">Swing</div>
            <div className="strategy-value positive">+28.7%</div>
          </div>
          <div className="strategy-card">
            <div className="strategy-name">Earnings</div>
            <div className="strategy-value positive">+19.5%</div>
          </div>
          <div className="strategy-card">
            <div className="strategy-name">Hedging</div>
            <div className="strategy-value positive">+12.2%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
