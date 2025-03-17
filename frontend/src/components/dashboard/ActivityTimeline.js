import React from 'react';
import './ActivityTimeline.css';

const ActivityTimeline = () => {
  // Sample activity timeline data
  const activities = [
    {
      id: 1,
      type: 'execution',
      title: 'SPY 490C Executed',
      description: 'Bought 5 contracts at $4.30',
      time: '13:45',
      source: {
        name: 'IronHawk',
        avatar: 'IH',
        color: '#388bfd'
      }
    },
    {
      id: 2,
      type: 'alert',
      title: 'MSFT Trade Alert',
      description: 'Bearish divergence detected',
      time: '11:20',
      source: {
        name: 'AutoBot',
        avatar: 'AB',
        color: '#8957e5'
      }
    },
    {
      id: 3,
      type: 'system',
      title: 'Market Open',
      description: 'Trading session started',
      time: '09:30'
    },
    {
      id: 4,
      type: 'execution',
      title: 'AAPL 180C Executed',
      description: 'Bought 3 contracts at $1.98',
      time: '09:35',
      source: {
        name: 'Sniper',
        avatar: 'SN',
        color: '#3fb950'
      }
    },
    {
      id: 5,
      type: 'alert',
      title: 'NVDA Trade Alert',
      description: 'Support level confirmed',
      time: '10:15',
      source: {
        name: 'AutoBot',
        avatar: 'AB',
        color: '#8957e5'
      }
    },
    {
      id: 6,
      type: 'system',
      title: 'AutoBot Scan',
      description: 'Scanned 267 options chains',
      time: '10:00'
    }
  ];
  
  const getIconForActivityType = (type) => {
    switch (type) {
      case 'execution':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
          </svg>
        );
      case 'alert':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
          </svg>
        );
      case 'system':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/>
          </svg>
        );
      default:
        return null;
    }
  };
  
  const getBackgroundColorForActivityType = (type) => {
    switch (type) {
      case 'execution':
        return 'rgba(34, 197, 94, 0.15)';
      case 'alert':
        return 'rgba(245, 158, 11, 0.15)';
      case 'system':
        return 'rgba(59, 130, 246, 0.15)';
      default:
        return 'rgba(139, 148, 158, 0.15)';
    }
  };
  
  const getTextColorForActivityType = (type) => {
    switch (type) {
      case 'execution':
        return 'var(--accent-green)';
      case 'alert':
        return 'var(--accent-orange)';
      case 'system':
        return 'var(--accent-blue)';
      default:
        return 'var(--text-primary)';
    }
  };

  return (
    <div className="activity-timeline-card">
      <div className="card-header">
        <h2 className="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.26 3C8.17 3 4 7.17 4 12.26c0 5.09 4.17 9.26 9.26 9.26 5.09 0 9.26-4.17 9.26-9.26 0-5.09-4.17-9.26-9.26-9.26zm0 16.52c-4 0-7.26-3.26-7.26-7.26S9.26 5 13.26 5s7.26 3.26 7.26 7.26-3.26 7.26-7.26 7.26z" fill="#3b82f6"/>
            <path d="M11.26 15.26h4v2h-4z" fill="#3b82f6"/>
            <path d="M13.26 7.26h-2v6h2z" fill="#3b82f6"/>
          </svg>
          Recent Activity
        </h2>
      </div>
      
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div 
              className="activity-icon" 
              style={{ 
                backgroundColor: getBackgroundColorForActivityType(activity.type),
                color: getTextColorForActivityType(activity.type)
              }}
            >
              {getIconForActivityType(activity.type)}
            </div>
            
            <div className="activity-content">
              <div className="activity-header">
                <div className="activity-title">{activity.title}</div>
                <div className="activity-time">{activity.time}</div>
              </div>
              
              <div className="activity-description">{activity.description}</div>
              
              {activity.source && (
                <div className="activity-source">
                  <div 
                    className="source-avatar" 
                    style={{ backgroundColor: activity.source.color }}
                  >
                    {activity.source.avatar}
                  </div>
                  <span>{activity.source.name}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
