import React, { useState } from 'react';
import './AIInsightsSection.css';

const AIInsightsSection = ({ insights, onExecuteTrade }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedInsight, setSelectedInsight] = useState(null);

  if (!insights || insights.length === 0) {
    return (
      <div className="insights-section">
        <h2 className="section-title">AI Trading Insights</h2>
        <div className="no-insights">No insights available</div>
      </div>
    );
  }

  const handleExecute = (insight) => {
    if (onExecuteTrade) {
      onExecuteTrade({
        symbol: insight.symbol,
        action: insight.recommendation === 'Buy' ? 'buy' : 'sell',
        quantity: 1,
        confidence: insight.confidence,
        source: 'AI Insight'
      });
    }
  };

  // Sort insights by confidence
  const sortedInsights = [...insights].sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="insights-section">
      <h2 className="section-title">AI Trading Insights</h2>
      
      <div className="insights-tabs">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button 
          className={`tab-btn ${activeTab === 'technical' ? 'active' : ''}`}
          onClick={() => setActiveTab('technical')}
        >
          Technical
        </button>
        <button 
          className={`tab-btn ${activeTab === 'fundamental' ? 'active' : ''}`}
          onClick={() => setActiveTab('fundamental')}
        >
          Fundamental
        </button>
        <button 
          className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          News
        </button>
      </div>
      
      <div className="insights-list">
        {sortedInsights
          .filter(insight => activeTab === 'all' || insight.category === activeTab)
          .map((insight, index) => (
            <div 
              key={index}
              className={`insight-card ${selectedInsight === insight ? 'selected' : ''}`}
              onClick={() => setSelectedInsight(insight)}
            >
              <div className="insight-header">
                <span className="insight-symbol">{insight.symbol}</span>
                <span className={`insight-recommendation ${insight.recommendation.toLowerCase()}`}>
                  {insight.recommendation}
                </span>
              </div>
              <p className="insight-summary">{insight.summary}</p>
              <div className="insight-footer">
                <span className="insight-confidence">{Math.round(insight.confidence * 100)}% Confidence</span>
                <span className="insight-category">{insight.category}</span>
                <button 
                  className="execute-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExecute(insight);
                  }}
                >
                  Execute
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AIInsightsSection;
