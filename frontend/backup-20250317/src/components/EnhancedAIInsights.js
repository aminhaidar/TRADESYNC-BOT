import React from 'react';
import './EnhancedAIInsights.css';

const EnhancedAIInsights = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return <div>No AI insights available</div>;
  }

  return (
    <div className="ai-insights">
      <h2>AI-Enhanced Trading Insights</h2>
      <ul>
        {insights.map((insight, idx) => (
          <li key={idx}>
            <strong>{insight.symbol}</strong>: {insight.recommendation} - {insight.summary} (Confidence: {insight.confidence})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EnhancedAIInsights;
