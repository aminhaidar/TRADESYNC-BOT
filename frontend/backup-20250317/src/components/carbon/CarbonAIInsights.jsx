import React, { useEffect, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import './CarbonAIInsights.scss';

const CarbonAIInsights = () => {
  const { socket } = useSocket();
  const [insights, setInsights] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!socket) return;

    socket.on('aiInsights', (data) => {
      setInsights(data);
    });

    // Request AI insights
    socket.emit('getAIInsights');

    return () => {
      socket.off('aiInsights');
    };
  }, [socket]);

  // Mock insights if none are received yet
  const mockInsights = [
    {
      id: 'hood-insight',
      symbol: 'HOOD',
      type: 'actionable',
      sentiment: 'bullish',
      content: 'Buy above $24.5, stop below today\'s low',
      detail: 'Looking for a move to $28 based on volume pattern and support levels. Watching for a breakout above the daily resistance.',
      confidence: 85,
      source: {
        name: 'SN',
        handle: '@ripster47',
        successRate: 80,
        timeAgo: '2h'
      },
      impactedPositions: 0
    },
    {
      id: 'btc-insight',
      symbol: 'BTC',
      type: 'ai',
      sentiment: 'bearish',
      content: '$332M short on BTC 😳',
      detail: 'Significant bearish pressure building in the market. Large institutional positions being established with downside targets.',
      confidence: 75,
      source: {
        name: 'AG',
        handle: '@AltcoinGordon',
        successRate: 72,
        timeAgo: '3h'
      },
      impactedPositions: 2,
      impactPercent: 10
    }
  ];

  // Filter insights based on active tab
  const getFilteredInsights = () => {
    if (activeTab === 'all') return mockInsights;
    return mockInsights.filter(insight => insight.type === activeTab);
  };

  return (
    <div className="card ai-insights-card">
      <div className="card-header">
        <h2 className="card-title">AI Trade Insights</h2>
      </div>

      <div className="insights-tabs">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Insights
        </button>
        <button 
          className={`tab-btn ${activeTab === 'actionable' ? 'active' : ''}`}
          onClick={() => setActiveTab('actionable')}
        >
          Actionable
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          AI Insights
        </button>
        <button 
          className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
      </div>

      <div className="insights-list">
        {getFilteredInsights().map((insight) => (
          <div 
            key={insight.id} 
            className={`insight-item ${insight.sentiment}`}
          >
            <div className="insight-header">
              <div className="insight-symbol">{insight.symbol}</div>
              
              <div className="insight-tags">
                <span className={`tag ${insight.type}`}>
                  {insight.type === 'actionable' ? 'Actionable Trade' : 'AI Insight'}
                </span>
                
                {insight.sentiment && (
                  <span className={`tag sentiment ${insight.sentiment}`}>
                    {insight.sentiment === 'bullish' ? 'Bullish' : 'Bearish'}
                  </span>
                )}
              </div>
              
              <div className="confidence-meter">
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <circle 
                    cx="16" 
                    cy="16" 
                    r="14" 
                    fill="transparent" 
                    stroke={insight.sentiment === 'bullish' ? 'var(--green)' : 
                           insight.sentiment === 'bearish' ? 'var(--red)' : 'var(--accent-blue)'}
                    strokeWidth="2"
                    strokeDasharray={`${insight.confidence * 0.88} 88`}
                    strokeDashoffset="22"
                    transform="rotate(-90, 16, 16)"
                  />
                  <text 
                    x="16" 
                    y="16" 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    className="confidence-text"
                    fill={insight.sentiment === 'bullish' ? 'var(--green)' : 
                         insight.sentiment === 'bearish' ? 'var(--red)' : 'var(--accent-blue)'}
                  >
                    {insight.confidence}%
                  </text>
                </svg>
              </div>
            </div>
            
            <div className="insight-content">
              <p className="primary-content">{insight.content}</p>
              <p className="detail-content">{insight.detail}</p>
            </div>
            
            {insight.impactedPositions > 0 && (
              <div className={`impact-alert ${insight.sentiment}`}>
                Impacts {insight.impactedPositions} open positions (-{insight.impactPercent}%)
              </div>
            )}
            
            <div className="insight-source">
              <div className={`source-avatar ${insight.source.name === 'SN' ? 'green' : 'blue'}`}>
                <span>{insight.source.name}</span>
                <div className="success-badge">
                  <span>{insight.source.successRate}%</span>
                </div>
              </div>
              <div className="source-info">
                <span className="handle">{insight.source.handle}</span>
                <span className="time-ago">{insight.source.timeAgo} ago</span>
              </div>
            </div>
            
            <div className="insight-actions">
              {insight.type === 'actionable' ? (
                <>
                  <button className="btn btn-success">Buy Now</button>
                  <button className="btn btn-outline-danger">Sell Now</button>
                  <button className="btn btn-outline">View Details</button>
                </>
              ) : (
                <>
                  <button className="btn btn-outline">Track</button>
                  <button className="btn btn-warning">Adjust Risk</button>
                  <button className="btn btn-primary">See Trade</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarbonAIInsights;
