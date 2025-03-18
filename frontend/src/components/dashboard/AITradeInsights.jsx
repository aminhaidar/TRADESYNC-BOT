import React, { useState } from 'react';
import { Button, ButtonSet, Tag } from '@carbon/react';
import { 
  Information, 
  WarningAlt, 
  ChartCandlestick, 
  ChartLine, 
  DocumentSentiment 
} from '@carbon/icons-react';

const AITradeInsights = ({ insights = [] }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [sentiment, setSentiment] = useState('all');
  
  const tabOptions = [
    { id: 'all', label: 'All Insights' },
    { id: 'technical', label: 'Technical' },
    { id: 'news', label: 'News' },
    { id: 'fundamental', label: 'Fundamental' }
  ];
  
  const sentimentOptions = [
    { id: 'all', label: 'All' },
    { id: 'bullish', label: 'Bullish' },
    { id: 'bearish', label: 'Bearish' },
    { id: 'neutral', label: 'Neutral' }
  ];
  
  // Sample insights - replace with your actual data
  const sampleInsights = [
    {
      id: 1,
      symbol: 'HOOD',
      type: 'Technical',
      sentiment: 'bullish',
      confidence: 82,
      source: '@ripster47',
      timeAgo: '47 min',
      message: 'Buy above $24.5, stop below today\'s low. Looking for a move to $28 based on volume pattern and support levels. Watching for a breakout above the daily resistance.'
    },
    {
      id: 2,
      symbol: 'BTC',
      type: 'AI Insight',
      sentiment: 'bearish',
      confidence: 75,
      source: '@AlconGordon',
      timeAgo: '30 min',
      message: '$33204 short on BTC. Significant bearish pressure building in the market. Large institutional positions being established with downside targets.'
    }
  ];
  
  const filteredInsights = activeTab === 'all' 
    ? sampleInsights 
    : sampleInsights.filter(insight => 
        insight.type.toLowerCase() === activeTab
      );
  
  const finalInsights = sentiment === 'all'
    ? filteredInsights
    : filteredInsights.filter(insight =>
        insight.sentiment === sentiment
      );

  return (
    <div style={{
      background: '#262626',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    }}>
      <h2 style={{ 
        fontSize: '1rem', 
        fontWeight: '600',
        marginBottom: '1.5rem',
        color: '#f4f4f4'
      }}>
        AI Trading Insights
      </h2>
      
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        flexWrap: 'wrap'
      }}>
        {tabOptions.map(tab => (
          <Button
            key={tab.id}
            kind={activeTab === tab.id ? 'primary' : 'tertiary'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <span style={{ color: '#8D8D8D', marginRight: '0.5rem' }}>Sentiment:</span>
        {sentimentOptions.map(option => (
          <Tag
            key={option.id}
            type={
              option.id === 'bullish' ? 'green' :
              option.id === 'bearish' ? 'red' :
              option.id === 'neutral' ? 'gray' : 'blue'
            }
            size="sm"
            style={{ 
              cursor: 'pointer',
              opacity: sentiment === option.id ? 1 : 0.7,
              fontWeight: sentiment === option.id ? 'bold' : 'normal'
            }}
            onClick={() => setSentiment(option.id)}
          >
            {option.label}
          </Tag>
        ))}
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {finalInsights.map(insight => (
          <div key={insight.id} style={{
            background: '#333333',
            borderRadius: '0.5rem',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontWeight: 'bold' }}>{insight.symbol}</span>
                <Tag
                  type={
                    insight.type === 'Technical' ? 'teal' :
                    insight.type === 'News' ? 'purple' :
                    insight.type === 'AI Insight' ? 'blue' : 'gray'
                  }
                  size="sm"
                >
                  {insight.type}
                </Tag>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 
                  insight.confidence > 80 ? 'rgba(63, 185, 80, 0.1)' :
                  insight.confidence > 60 ? 'rgba(245, 166, 35, 0.1)' :
                  'rgba(248, 81, 73, 0.1)',
                color: 
                  insight.confidence > 80 ? '#3FB950' :
                  insight.confidence > 60 ? '#F5A623' :
                  '#F85149',
                padding: '4px 8px',
                borderRadius: '1rem',
                fontSize: '0.875rem'
              }}>
                {insight.confidence}%
              </div>
            </div>
            
            <p style={{ margin: 0, lineHeight: '1.5' }}>
              {insight.message}
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                color: '#8D8D8D'
              }}>
                <span>{insight.source}</span>
                <span>•</span>
                <span>{insight.timeAgo} ago</span>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                {insight.id === 1 && (
                  <>
                    <Button size="sm" kind="primary">Buy Now</Button>
                    <Button size="sm" kind="danger">Sell Now</Button>
                  </>
                )}
                <Button size="sm" kind="ghost">View Details</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AITradeInsights;
