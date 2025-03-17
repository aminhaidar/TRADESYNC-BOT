import React, { useState, useEffect } from 'react';
import './AIInsights.css';

const AIInsights = ({ insights, onExecuteTrade }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSentiment, setActiveSentiment] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState(0);
  const [filteredInsights, setFilteredInsights] = useState([]);
  const [selectedInsight, setSelectedInsight] = useState(null);

  // Apply filters to insights
  useEffect(() => {
    if (!insights) return;
    
    const filtered = insights.filter(insight => {
      const categoryMatch = activeCategory === 'all' || insight.category === activeCategory;
      const sentimentMatch = activeSentiment === 'all' || insight.recommendation.toLowerCase() === activeSentiment.toLowerCase();
      const confidenceMatch = insight.confidence * 100 >= confidenceFilter;
      return categoryMatch && sentimentMatch && confidenceMatch;
    });
    
    setFilteredInsights([...filtered].sort((a, b) => b.confidence - a.confidence));
  }, [insights, activeCategory, activeSentiment, confidenceFilter]);

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

  // High confidence insights
  const highConfidenceInsights = filteredInsights.filter(insight => insight.confidence >= 0.8);

  return (
    <div className="insights-section">
      <h2 className="section-title">AI Trading Insights</h2>
      
      <div className="insights-filters">
        <div className="filter-group">
          <span className="filter-label">Category:</span>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${activeCategory === 'technical' ? 'active' : ''}`}
              onClick={() => setActiveCategory('technical')}
            >
              Technical
            </button>
            <button 
              className={`filter-btn ${activeCategory === 'fundamental' ? 'active' : ''}`}
              onClick={() => setActiveCategory('fundamental')}
            >
              Fundamental
            </button>
            <button 
              className={`filter-btn ${activeCategory === 'news' ? 'active' : ''}`}
              onClick={() => setActiveCategory('news')}
            >
              News
            </button>
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Sentiment:</span>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${activeSentiment === 'all' ? 'active' : ''}`}
              onClick={() => setActiveSentiment('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn sentiment-buy ${activeSentiment === 'buy' ? 'active' : ''}`}
              onClick={() => setActiveSentiment('buy')}
            >
              Bullish
            </button>
            <button 
              className={`filter-btn sentiment-sell ${activeSentiment === 'sell' ? 'active' : ''}`}
              onClick={() => setActiveSentiment('sell')}
            >
              Bearish
            </button>
            <button 
              className={`filter-btn sentiment-hold ${activeSentiment === 'hold' ? 'active' : ''}`}
              onClick={() => setActiveSentiment('hold')}
            >
              Neutral
            </button>
          </div>
        </div>

        <div className="filter-group slider-group">
          <span className="filter-label">Min Confidence: {confidenceFilter}%</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={confidenceFilter} 
            onChange={(e) => setConfidenceFilter(parseInt(e.target.value))}
            className="confidence-slider"
          />
        </div>
      </div>
      
      {/* High Confidence Section */}
      {highConfidenceInsights.length > 0 && (
        <div className="high-confidence-section">
          <h3 className="subsection-title">
            <span className="highlight">High Confidence Trades</span>
            <span className="count-badge">{highConfidenceInsights.length}</span>
          </h3>
          <div className="insights-list">
            {highConfidenceInsights.map((insight, index) => (
              <div 
                key={`high-${index}`}
                className={`insight-card high-confidence ${selectedInsight === insight ? 'selected' : ''}`}
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
      )}
      
      {/* All Filtered Insights Section */}
      <div className="all-insights-section">
        <h3 className="subsection-title">
          All Filtered Insights
          <span className="count-badge">{filteredInsights.length}</span>
        </h3>
        <div className="insights-list">
          {filteredInsights.map((insight, index) => (
            <div 
              key={`all-${index}`}
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
    </div>
  );
};

export default AIInsights;
