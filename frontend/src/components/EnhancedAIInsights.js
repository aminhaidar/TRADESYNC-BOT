import React from 'react';

const EnhancedAIInsights = ({ insights }) => {
  // Map current categories to new structure
  const categorizeInsight = (category) => {
    if (category === 'actionable') return 'Actionable Trade';
    if (category === 'technical') return 'AI Insight';
    return 'General Insight'; // Default for others
  };

  // Map sentiment based on recommendation
  const getSentiment = (recommendation) => {
    if (recommendation === 'Buy') return 'Bullish';
    if (recommendation === 'Sell') return 'Bearish';
    return 'Neutral';
  };

  return (
    <div className="insights-grid">
      {insights.length > 0 ? (
        insights.map((insight, index) => {
          const mappedCategory = categorizeInsight(insight.category);
          const sentiment = getSentiment(insight.recommendation);
          const subcategory = insight.category === 'technical' ? 'Market Insight' : insight.category === 'actionable' ? 'N/A' : 'Community/Noise';
          return (
            <div key={index} className={`insight-card ${mappedCategory.toLowerCase().replace(/\s/g, '-')}`}>
              <div className="insight-header">
                <div className="insight-meta-header">
                  <span className="insight-symbol">{insight.symbol}</span>
                  <span className="insight-type">{mappedCategory}</span>
                  <span className="insight-meta">Source: {insight.source} • {new Date(insight.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="insight-confidence">AI: {Math.round(insight.confidence * 100)}%</div>
              </div>
              <div className="insight-content">
                <p>{insight.summary}</p>
                {insight.option_details && <p><strong>Option:</strong> {insight.option_details}</p>}
                <p><strong>Subcategory:</strong> {subcategory}</p>
                <p><strong>Sentiment:</strong> <span className={sentiment.toLowerCase()}>{sentiment}</span></p>
                <p><strong>Related Trades:</strong> N/A</p>
              </div>
              <div className="insight-footer">
                <div className="insight-actions">
                  {mappedCategory === 'Actionable Trade' ? (
                    <>
                      <button className="btn btn-primary" onClick={() => console.log('Buy Now', insight.symbol)}>Buy Now</button>
                      <button className="btn btn-secondary" onClick={() => console.log('Sell Now', insight.symbol)}>Sell Now</button>
                    </>
                  ) : mappedCategory === 'AI Insight' ? (
                    <>
                      <button className="btn btn-secondary" onClick={() => console.log('Track', insight.symbol)}>Track</button>
                      <button className="btn btn-secondary" onClick={() => console.log('Adjust Risk', insight.symbol)}>Adjust Risk</button>
                      <button className="btn btn-link link-to-trade" onClick={() => console.log('Link to Trade', insight.symbol)}>Go to Trade</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-secondary" onClick={() => console.log('Track', insight.symbol)}>Track</button>
                      <button className="btn btn-secondary" onClick={() => console.log('Dismiss', insight.symbol)}>Dismiss</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="no-insights">No insights available</div>
      )}
    </div>
  );
};

export default EnhancedAIInsights;
