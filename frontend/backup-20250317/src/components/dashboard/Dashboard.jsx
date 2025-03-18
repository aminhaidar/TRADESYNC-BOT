import React from 'react';
import { Grid, Column } from '@carbon/react';
import MarketTicker from './MarketTicker';
import AccountSummary from './AccountSummary';
import Positions from './Positions';
import Performance from './Performance';
import TradingStats from './TradingStats';
import AITradeInsights from './AITradeInsights';

const Dashboard = ({ 
  marketData = {}, 
  accountSummary = {},
  positions = [],
  performanceData = [],
  tradingStats = {}
}) => {
  return (
    <div className="dashboard">
      <Grid fullWidth>
        <Column sm={4} md={8} lg={12}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            color: '#f4f4f4'
          }}>
            Dashboard
          </h1>
        </Column>
      </Grid>
      
      <MarketTicker marketData={marketData} />
      
      <Grid fullWidth>
        <Column sm={4} md={4} lg={8}>
          <Positions positions={positions} />
          <AITradeInsights />
        </Column>
        
        <Column sm={4} md={4} lg={4}>
          <AccountSummary accountSummary={accountSummary} />
          <Performance performanceData={performanceData} />
          <TradingStats stats={tradingStats} />
        </Column>
      </Grid>
    </div>
  );
};

export default Dashboard;
