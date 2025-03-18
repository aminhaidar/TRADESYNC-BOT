import React from 'react';
import { Grid, Column, Link } from '@carbon/react';

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

const MarketTicker = ({ marketData = {} }) => {
  return (
    <div>
      <Grid fullWidth>
        <Column sm={4} md={8} lg={12}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            {Object.values(marketData).map(data => {
              if (!data || !data.symbol) return null;
              
              const displayPrice = data.symbol === 'BTC' ?
                `$${Math.round(data.price || 0).toLocaleString()}` :
                `$${formatNumber(data.price)}`;
              
              return (
                <div key={data.symbol} style={{
                  background: '#262626',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{data.symbol}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{displayPrice}</div>
                  <div style={{
                    display: 'inline-flex',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    backgroundColor: (data.change > 0) ? 'rgba(63, 185, 80, 0.1)' : 
                                  (data.change < 0) ? 'rgba(248, 81, 73, 0.1)' : 'transparent',
                    color: (data.change > 0) ? '#3FB950' : 
                          (data.change < 0) ? '#F85149' : '#F6F8FA',
                    alignSelf: 'flex-start'
                  }}>
                    {(data.change > 0) ? '+' : ''}{formatNumber(data.change, 1)}%
                  </div>
                </div>
              );
            })}

            <div style={{
              background: '#262626',
              borderRadius: '0.5rem',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f62fe',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              View All Markets
            </div>
          </div>
        </Column>
      </Grid>
    </div>
  );
};

export default MarketTicker;
