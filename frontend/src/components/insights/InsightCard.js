import React from 'react';

const InsightCard = ({ insight, onExecute }) => {
  const { symbol, recommendation, summary, confidence } = insight;
  
  const getRecommendationClass = (rec) => {
    switch(rec) {
      case 'Buy':
        return 'positive';
      case 'Sell':
        return 'negative';
      default:
        return 'neutral';
    }
  };
  
  const getConfidenceLevel = (conf) => {
    if (conf >= 0.8) return 'high';
    if (conf >= 0.6) return 'medium';
    return 'low';
  };
  
  const handleExecute = () => {
    onExecute({
      symbol,
      action: recommendation.toLowerCase(),
      confidence
    });
  };
  
  return (
    <div className="insight-card">
      <div className="insight-header">
        <div className="insight-symbol">{symbol}</div>
        <div className={`insight-recommendation ${getRecommendationClass(recommendation)}`}>
          {recommendation}
        </div>
      </div>
      
      <div className="insight-summary">{summary}</div>
      
      <div className="insight-footer">
        <div className={`confidence-indicator ${getConfidenceLevel(confidence)}`}>
          Confidence: {(confidence * 100).toFixed(0)}%
        </div>
        
        <button 
          className="btn btn-sm btn-primary execute-btn"
          onClick={handleExecute}
        >
          Execute
        </button>
      </div>
    </div>
  );
};

export default InsightCard;
