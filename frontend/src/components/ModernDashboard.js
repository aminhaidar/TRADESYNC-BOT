import React, { useState, useEffect, useContext } from 'react';
import './ModernDashboard.css';
import { SocketContext } from '../context/SocketContext';

const EnhancedModernDashboard = () => {
  const [activeTab, setActiveTab] = useState('high-confidence');
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    // Function to fetch initial insights
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/api/insights');
        if (!response.ok) {
          throw new Error('Failed to fetch insights');
        }
        const data = await response.json();
        setInsights(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching insights:', err);
        setError('Unable to load AI insights. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchInsights();

    // Set up socket event listener for real-time updates
    if (socket) {
      socket.on('insight_update', (newInsight) => {
        setInsights(prevInsights => {
          // Check if this insight already exists (by ID or some unique property)
          const existingIndex = prevInsights.findIndex(item => item.id === newInsight.id);
          
          if (existingIndex >= 0) {
            // Update existing insight
            const updatedInsights = [...prevInsights];
            updatedInsights[existingIndex] = newInsight;
            return updatedInsights;
          } else {
            // Add new insight
            return [newInsight, ...prevInsights];
          }
        });
      });
    }

    // Cleanup
    return () => {
      if (socket) {
        socket.off('insight_update');
      }
    };
  }, [socket]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const refreshInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/insights/refresh');
      if (!response.ok) {
        throw new Error('Failed to refresh insights');
      }
      const data = await response.json();
      setInsights(data);
      setError(null);
    } catch (err) {
      console.error('Error refreshing insights:', err);
      setError('Unable to refresh AI insights. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get appropriate color-coding class for recommendation type
  const getRecommendationClass = (recommendation) => {
    if (!recommendation) return '';
    
    const recommendationLower = recommendation.toLowerCase();
    if (recommendationLower.includes('buy') || recommendationLower.includes('bullish')) {
      return 'bullish';
    } else if (recommendationLower.includes('sell') || recommendationLower.includes('bearish')) {
      return 'bearish';
    }
    return '';
  };

  // Filter insights based on active tab
  const filteredInsights = insights.filter(insight => {
    if (activeTab === 'all-insights') return true;
    if (activeTab === 'high-confidence') return insight.confidence >= 85;
    if (activeTab === 'by-source') {
      // This would need to be customized based on how you want to filter by source
      return true;
    }
    return true;
  });

  // Mock data for when we don't have real data yet
  const mockInsights = [
    {
      id: 1,
      symbol: 'NVDA',
      type: 'Momentum Trade',
      recommendation: 'Buy',
      content: 'Bullish momentum building after data center revenue beat expectations. Support at $820 zone with significant institutional buying.',
      confidence: 92,
      timeframe: 'Short-term',
      source: 'Sniper + AI',
      sourceAvatarInitials: 'SN',
      sourceAvatarColor: '#3FB950',
      timestamp: '10:32 AM'
    },
    {
      id: 2,
      symbol: 'META',
      type: 'Swing Trade',
      recommendation: 'Sell',
      content: 'Bearish divergence on RSI with resistance at $490. Potential pullback to 50-day moving average after Q1 ad revenue concerns.',
      confidence: 87,
      timeframe: 'Mid-term',
      source: 'IronHawk + AI',
      sourceAvatarInitials: 'IH',
      sourceAvatarColor: '#388BFD',
      timestamp: '9:45 AM'
    },
    {
      id: 3,
      symbol: 'TSLA',
      type: 'Options Strategy',
      recommendation: 'Hold',
      content: 'Consolidation pattern with high implied volatility suggests iron condor strategy (720/740/780/800). Expected range-bound until delivery numbers.',
      confidence: 84,
      timeframe: 'Income',
      source: 'ManzTrades + AI',
      sourceAvatarInitials: 'MT',
      sourceAvatarColor: '#DB6D28',
      timestamp: '11:15 AM'
    },
    {
      id: 4,
      symbol: 'AAPL',
      type: 'Breakout',
      recommendation: 'Buy',
      content: 'Bullish breakout above $185 resistance with increasing volume. New AI chip announcement expected to drive iPhone sales in Asia markets.',
      confidence: 89,
      timeframe: 'Long-term',
      source: 'TradeSync AI',
      sourceAvatarInitials: 'AI',
      sourceAvatarColor: '#8957E5',
      timestamp: '10:05 AM'
    }
  ];

  // Use mock data if no real data is available
  const displayInsights = insights.length > 0 ? filteredInsights : mockInsights;

  return (
    <div className="dashboard-content">
      {/* Header */}
      <header className="app-header">
        <div className="logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 13H13V16C13 16.55 12.55 17 12 17C11.45 17 11 16.55 11 16V13H8C7.45 13 7 12.55 7 12C7 11.45 7.45 11 8 11H11V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V11H16C16.55 11 17 11.45 17 12C17 12.55 16.55 13 16 13Z" fill="#388BFD"/>
          </svg>
          <h1>Trade<span className="accent">Sync</span> <span className="version-tag">v2.0</span></h1>
        </div>
        
        <div className="market-tickers">
          <div className="ticker">
            <span className="ticker-name">SPY</span>
            <span className="ticker-value">483.27</span>
            <span className="ticker-change positive">+1.24%</span>
          </div>
          <div className="ticker">
            <span className="ticker-name">QQQ</span>
            <span className="ticker-value">414.93</span>
            <span className="ticker-change positive">+1.87%</span>
          </div>
          <div className="ticker">
            <span className="ticker-name">VIX</span>
            <span className="ticker-value">17.28</span>
            <span className="ticker-change negative">-5.36%</span>
          </div>
        </div>
      </header>

      {/* Dashboard Layout Controls */}
      <div className="dashboard-layout-controls">
        <button className="layout-btn active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 11h16v2H4v-2zm0-4h16v2H4V7zm0 8h16v2H4v-2z" fill="currentColor"/>
          </svg>
          Default
        </button>
        <button className="layout-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H5V7h7v10zm7 0h-5V7h5v10z" fill="currentColor"/>
          </svg>
          Trading Focus
        </button>
        <button className="layout-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="currentColor"/>
          </svg>
          Analytics
        </button>
        <button className="refresh-btn" onClick={refreshInsights}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* AI Insights Card */}
      <div className="ai-insights-card">
        <div className="card-header">
          <h2 className="card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 7H13V9H11V7ZM11 11H13V17H11V11ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#8957E5"/>
            </svg>
            AI Insights & Trade Opportunities
          </h2>
          <div className="card-actions">
            <button className="btn" onClick={refreshInsights}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
              </svg>
              Refresh
            </button>
            <button className="btn btn-success">
              Execute All
            </button>
          </div>
        </div>
        
        <div className="insights-tabs">
          <button 
            className={`tab-btn ${activeTab === 'high-confidence' ? 'active' : ''}`}
            onClick={() => handleTabClick('high-confidence')}
          >
            High Confidence
          </button>
          <button 
            className={`tab-btn ${activeTab === 'all-insights' ? 'active' : ''}`}
            onClick={() => handleTabClick('all-insights')}
          >
            All Insights
          </button>
          <button 
            className={`tab-btn ${activeTab === 'by-source' ? 'active' : ''}`}
            onClick={() => handleTabClick('by-source')}
          >
            By Source
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <span>Loading AI insights...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-container">
            <div className="error-message">
              <svg className="error-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
              </svg>
              <div className="error-text">{error}</div>
            </div>
            <button className="retry-btn" onClick={refreshInsights}>Try Again</button>
          </div>
        )}

        {/* Insights Grid */}
        {!loading && !error && (
          <>
            <div className="insights-grid">
              {displayInsights.map((insight) => (
                <div key={insight.id} className={`insight-card ${getRecommendationClass(insight.recommendation)}`}>
                  <div className="insight-header">
                    <div className="insight-title">
                      <span className="insight-symbol">{insight.symbol}</span>
                      <span className="insight-type">{insight.type}</span>
                    </div>
                    <div className="insight-meta">
                      <div className="insight-source">
                        <div className="source-avatar" style={{ backgroundColor: insight.sourceAvatarColor || '#8957E5' }}>
                          {insight.sourceAvatarInitials || 'AI'}
                        </div>
                        <span>{insight.source || 'TradeSync AI'}</span>
                      </div>
                      <div className="insight-time">{insight.timestamp || new Date().toLocaleTimeString()}</div>
                    </div>
                  </div>
                  <div className="insight-content">
                    <p>{insight.content}</p>
                  </div>
                  <div className="insight-footer">
                    <div className="insight-tags">
                      <span className="insight-tag">AI Confidence: {insight.confidence || 85}%</span>
                      <span className="insight-tag">{insight.timeframe || 'Short-term'}</span>
                    </div>
                    <button className="btn btn-primary">Execute</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="insights-actions">
              <button className="btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 14l5-5 5 5H7z" fill="currentColor"/>
                </svg>
                Load More
              </button>
              <div className="insights-count">
                Showing {displayInsights.length} of {insights.length || mockInsights.length} insights
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedModernDashboard;