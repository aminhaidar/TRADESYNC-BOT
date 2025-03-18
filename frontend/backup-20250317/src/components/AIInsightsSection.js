import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import './AIInsightsSection.css';

const AIInsightsSection = ({ insights, refreshData }) => {
  const { isConnected, executeTrade } = useSocket();
  const [activeTab, setActiveTab] = useState('actionable');
  const [filter, setFilter] = useState('all');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleExecute = (insight) => {
    const tradeData = {
      symbol: insight.symbol,
      action: insight.recommendation.toLowerCase() === 'buy' ? 'buy' : 'sell',
      quantity: 1,
      price: 0, // Will be filled by backend
      confidence: insight.confidence,
      source: 'AI Insight',
      option_details: insight.option_details || ''
    };
    
    if (executeTrade(tradeData)) {
      console.log('Trade execution requested');
      setTimeout(() => {
        refreshData();
      }, 1000);
    } else {
      console.error('Failed to execute trade');
    }
  };

  // Filter insights based on active tab and sentiment filter
  const filteredInsights = insights.filter(insight => {
    if (activeTab === 'actionable') {
      return insight.category === 'actionable';
    } else if (activeTab === 'high-conviction') {
      return insight.confidence >= 0.8;
    } else if (activeTab === 'executed') {
      return insight.executed;
    } else if (activeTab === 'sectors') {
      return insight.category === 'sector';
    } else if (activeTab === 'news') {
      return insight.category === 'news';
    }
    return true;
  }).filter(insight => {
    if (filter === 'bullish') {
      return insight.recommendation.toLowerCase() === 'buy';
    } else if (filter === 'bearish') {
      return insight.recommendation.toLowerCase() === 'sell';
    }
    return true;
  });

  return (
    <div className="insights-section dashboard-card">
      <div className="insights-header">
        <h2>AI Insights</h2>
        <div className="insights-filters">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-dropdown"
          >
            <option value="all">All Sentiment</option>
            <option value="bullish">Bullish</option>
            <option value="bearish">Bearish</option>
          </select>
        </div>
      </div>
      
      <div className="insights-tabs">
        <button 
          className={`tab ${activeTab === 'actionable' ? 'active' : ''}`}
          onClick={() => handleTabChange('actionable')}
        >
          Actionable
        </button>
        <button 
          className={`tab ${activeTab === 'high-conviction' ? 'active' : ''}`}
          onClick={() => handleTabChange('high-conviction')}
        >
          High Conviction
        </button>
        <button 
          className={`tab ${activeTab === 'executed' ? 'active' : ''}`}
          onClick={() => handleTabChange('executed')}
        >
          Executed
        </button>
        <button 
          className={`tab ${activeTab === 'sectors' ? 'active' : ''}`}
          onClick={() => handleTabChange('sectors')}
        >
          Sectors
        </button>
        <button 
          className={`tab ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => handleTabChange('news')}
        >
          News
        </button>
      </div>
      
      <div className="insights-content">
        {filteredInsights.length > 0 ? (
          filteredInsights.map((insight, index) => (
            <div key={index} className="insight-card">
              <div className="insight-header">
                <div className="insight-symbol">{insight.symbol}</div>
                <div className={`insight-recommendation ${insight.recommendation.toLowerCase() === 'buy' ? 'bullish' : 'bearish'}`}>
                  {insight.recommendation}
                </div>
              </div>
              <div className="insight-summary">{insight.summary}</div>
              <div className="insight-footer">
                <div className="insight-meta">
                  <span className="insight-confidence">Confidence: {Math.round(insight.confidence * 100)}%</span>
                  {insight.option_details && (
                    <span className="insight-option">{insight.option_details}</span>
                  )}
                  <span className="insight-source">Source: {insight.source || 'AI Analysis'}</span>
                </div>
                {activeTab !== 'executed' && (
                  <button 
                    className="execute-button"
                    onClick={() => handleExecute(insight)}
                    disabled={!isConnected}
                  >
                    {isConnected ? 'Execute' : 'Offline'}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-insights">No insights available for this tab/filter combination.</div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsSection;
