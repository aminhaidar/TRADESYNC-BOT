import React, { useState } from 'react';
import { Button, Grid, Column } from '@carbon/react';
import { Add, OverflowMenuVertical } from '@carbon/icons-react';

const formatNumber = (num, digits = 2) => {
  if (num === undefined || num === null) return '-';
  return num.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
};

const formatCurrency = (num) => {
  if (num === undefined || num === null) return '-';
  return `$${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const Positions = ({ positions = [] }) => {
  const [expandedPositions, setExpandedPositions] = useState({});

  const togglePosition = (id) => {
    setExpandedPositions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div style={{
      background: '#262626',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ 
          fontSize: '1rem', 
          fontWeight: '600',
          color: '#f4f4f4'
        }}>
          Open Positions
        </h2>
        
        <Button 
          renderIcon={Add}
          size="sm"
          kind="primary"
        >
          New Trade
        </Button>
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {positions.map(position => {
          const isStock = position.type !== 'option';
          const borderColor = position.isProfit ? '#3FB950' : '#F85149';
          
          return (
            <div key={position.id} style={{
              background: '#333333',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              borderLeft: `4px solid ${borderColor}`
            }}>
              <div 
                onClick={() => togglePosition(position.id)}
                style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
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
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: isStock ? '#3FB950' : '#F5A623'
                    }}></div>
                    <span style={{ fontWeight: '600' }}>
                      {isStock ? `${position.symbol} Stock` : position.symbol}
                    </span>
                  </div>
                  
                  <OverflowMenuVertical size={16} />
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  <div>
                    <div style={{ color: '#8D8D8D' }}>Quantity</div>
                    <div>{position.quantity}</div>
                  </div>
                  
                  <div>
                    <div style={{ color: '#8D8D8D' }}>Entry Price</div>
                    <div>{formatCurrency(position.entryPrice)}</div>
                  </div>
                  
                  <div>
                    <div style={{ color: '#8D8D8D' }}>Current Price</div>
                    <div>{formatCurrency(position.currentPrice)}</div>
                  </div>
                  
                  <div>
                    <div style={{ color: '#8D8D8D' }}>Cost Basis</div>
                    <div>{formatCurrency(position.costBasis)}</div>
                  </div>
                  
                  <div>
                    <div style={{ color: '#8D8D8D' }}>P/L ($)</div>
                    <div style={{ color: position.isProfit ? '#3FB950' : '#F85149' }}>
                      {position.isProfit ? '+' : ''}{formatCurrency(position.plValue)}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ color: '#8D8D8D' }}>P/L (%)</div>
                    <div style={{ color: position.isProfit ? '#3FB950' : '#F85149' }}>
                      {position.isProfit ? '+' : ''}{formatNumber(position.plPercent, 1)}%
                    </div>
                  </div>
                </div>
              </div>
              
              {expandedPositions[position.id] && (
                <div style={{
                  padding: '1rem',
                  borderTop: '1px solid #444444',
                  display: 'flex',
                  gap: '0.5rem',
                  justifyContent: 'flex-end'
                }}>
                  <Button kind="tertiary" size="sm">Buy More</Button>
                  <Button kind="danger" size="sm">Sell Position</Button>
                  <Button kind="ghost" size="sm">View Details</Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Positions;
