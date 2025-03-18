import React from 'react';

const TradingStats = ({ stats = {} }) => {
  const {
    winRate = 78,
    winCount = 21,
    totalTrades = 27,
    averageGain = 14.2,
    averageLoss = 8.6
  } = stats;

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
        Trading Stats
      </h2>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div style={{
          background: '#333333',
          borderRadius: '0.5rem',
          padding: '1rem'
        }}>
          <div style={{ color: '#8D8D8D', marginBottom: '0.25rem' }}>
            Win Rate
          </div>
          <div style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600' 
          }}>
            {winRate}% ({winCount}/{totalTrades})
          </div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem'
        }}>
          <div style={{
            background: '#333333',
            borderRadius: '0.5rem',
            padding: '1rem'
          }}>
            <div style={{ color: '#8D8D8D', marginBottom: '0.25rem' }}>
              Average Gain
            </div>
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600',
              color: '#3FB950'
            }}>
              +{averageGain}%
            </div>
          </div>
          
          <div style={{
            background: '#333333',
            borderRadius: '0.5rem',
            padding: '1rem'
          }}>
            <div style={{ color: '#8D8D8D', marginBottom: '0.25rem' }}>
              Average Loss
            </div>
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600',
              color: '#F85149'
            }}>
              -{averageLoss}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingStats;
