import React from 'react';
import { Grid, Column } from '@carbon/react';

const formatCurrency = (num) => {
  if (num === undefined || num === null) return '-';
  return `$${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const AccountSummary = ({ accountSummary = {} }) => {
  const {
    totalValue = 0,
    availableCash = 0,
    openPL = 0,
    closedPL = 0
  } = accountSummary;

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
        marginBottom: '1rem',
        color: '#f4f4f4'
      }}>
        Account Summary
      </h2>
      
      <div style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: '#ffffff'
      }}>
        {formatCurrency(totalValue)}
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem',
          background: '#333333',
          borderRadius: '0.25rem'
        }}>
          <div style={{ color: '#c6c6c6' }}>Available Cash</div>
          <div style={{ fontWeight: '600', color: '#f4f4f4' }}>{formatCurrency(availableCash)}</div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            padding: '0.75rem',
            background: '#333333',
            borderRadius: '0.25rem'
          }}>
            <div style={{ color: '#c6c6c6', fontSize: '0.875rem' }}>Open P/L</div>
            <div style={{ 
              fontWeight: '600', 
              color: (openPL >= 0) ? '#3FB950' : '#F85149',
              fontSize: '1rem'
            }}>
              {(openPL >= 0) ? '+' : ''}{formatCurrency(openPL)}
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            padding: '0.75rem',
            background: '#333333',
            borderRadius: '0.25rem'
          }}>
            <div style={{ color: '#c6c6c6', fontSize: '0.875rem' }}>Closed P/L</div>
            <div style={{ 
              fontWeight: '600', 
              color: (closedPL >= 0) ? '#3FB950' : '#F85149',
              fontSize: '1rem'
            }}>
              {(closedPL >= 0) ? '+' : ''}{formatCurrency(closedPL)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;
