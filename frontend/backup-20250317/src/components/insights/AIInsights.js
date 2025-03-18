import React, { useState } from 'react';

const AIInsights = ({ insights, onInsightSelect, onExecuteTrade, selectedInsight }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSentiment, setActiveSentiment] = useState('all');
  
  // Ensure insights is always an array
  const insightsArray = Array.isArray(insights) ? insights : [];
  
  if (insightsArray.length === 0) {
    return (
      <div className="insights-container">
        <h2 className="insights-title">AI Trading Insights</h2>
        <div className="no-insights">No insights available</div>
      </div>
    );
  }
  
  const categories = [
    { id: 'all', label: 'All Insights' },
    { id: 'technical', label: 'Technical' },
    { id: 'news', label: 'News' },
    { id: 'fundamental', label: 'Fundamental' }
  ];
  
  const sentiments = [
    { id: 'all', label: 'All' },
    { id: 'Buy', label: 'Bullish' },
    { id: 'Sell', label: 'Bearish' },
    { id: 'Hold', label: 'Neutral' }
  ];
  
  // Filter insights
  const filteredInsights = insightsArray.filter(insight => {
    const categoryMatch = activeCategory === 'all' || insight.category === activeCategory;
    const sentimentMatch = activeSentiment === 'all' || insight.recommendation === activeSentiment;
    return categoryMatch && sentimentMatch;
  });
  
  // Sort by confidence (high to low)
  const sortedInsights = [...filteredInsights].sort((a, b) => b.confidence - a.confidence);
  
  // Highlight high conviction trades (confidence > 80%)
  const highConviction = sortedInsights.filter(insight => insight.confidence >= 0.8);
  const regularInsights = sortedInsights.filter(insight => insight.confidence < 0.8);
  
  const handleExecute = (insight) => {
    onExecuteTrade({
      symbol: insight.symbol,
      action: insight.recommendation.toLowerCase(),
      confidence: insight.confidence,
      summary: insight.summary
    });
  };
  
  return (
    <div className="insights-container">
      <h2 className="insights-title">AI Trading Insights</h2>
      
      <div className="insights-filters">
        <div className="categories">
          {categories.map(category => (
            <button
              key={category.id}
              className={activeCategory === category.id ? 'active' : ''}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
        
        <div className="categories">
          {sentiments.map(sentiment => (
            <div
              key={sentiment.id}
              className={`sentiment-option ${activeSentiment === sentiment.id ? 'active' : ''}`}
              data-sentiment={sentiment.id}
              onClick={() => setActiveSentiment(sentiment.id)}
            >
              {sentiment.label}
            </div>
          ))}
        </div>
      </div>
      
      {highConviction.length > 0 && (
        <>
          <div className="section-title">Actionable Trades</div>
          <div className="insights-list">
            {highConviction.map((insight, index) => (
              <div 
                key={index}
                className={`insight-card high-conviction ${selectedInsight === insight ? 'selected' : ''}`}
                onClick={() => onInsightSelect(insight)}
              >
                <div className="insight-header">
                  <div className="insight-symbol">{insight.symbol}</div>
                  <div className={`insight-recommendation ${insight.recommendation.toLowerCase()}`}>
                    {insight.recommendation}
                  </div>
                </div>
                
                <div className="insight-summary">{insight.summary}</div>
                
                <div className="insight-footer">
                  <div className="insight-source">
                    <div className="source-avatar">
                      {insight.category === 'technical' ? 'SN' : 'AG'}
                    </div>
                    <div className="source-info">
                      <div className="source-name">
                        {insight.category === 'technical' ? '@ripster47' : '@AltcoinGordon'}
                      </div>
                      <div className="source-time">2h ago</div>
                    </div>
                  </div>
                  <div className="insight-actions">
                    <button 
                      className={`btn ${insight.recommendation.toLowerCase()}-btn`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExecute(insight);
                      }}
                    >
                      {insight.recommendation} Now
                    </button>
                    <button className="btn view-btn">View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {regularInsights.length > 0 && (
        <>
          <div className="section-title">All Insights</div>
          <div className="insights-list">
            {regularInsights.map((insight, index) => (
              <div 
                key={index}
                className={`insight-card ${selectedInsight === insight ? 'selected' : ''}`}
                onClick={() => onInsightSelect(insight)}
              >
                <div className="insight-header">
                  <div className="insight-symbol">{insight.symbol}</div>
                  <div className={`insight-recommendation ${insight.recommendation.toLowerCase()}`}>
                    {insight.recommendation}
                  </div>
                </div>
                
                <div className="insight-summary">{insight.summary}</div>
                
                <div className="insight-footer">
                  <div className="insight-source">
                    <div className={`source-avatar ${insight.category === 'news' ? 'blue' : ''}`}>
                      {insight.category === 'technical' ? 'SN' : 'AG'}
                    </div>
                    <div className="source-info">
                      <div className="source-name">
                        {insight.category === 'technical' ? '@ripster47' : '@AltcoinGordon'}
                      </div>
                      <div className="source-time">3h ago</div>
                    </div>
                  </div>
                  <div className="insight-actions">
                    <button className="btn track-btn">Track</button>
                    <button className="btn view-btn">View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AIInsights;
