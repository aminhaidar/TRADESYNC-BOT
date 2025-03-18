import React from 'react';
import {
  Tile,
  Grid,
  Row,
  Column,
  Button
} from 'carbon-components-react';
import { Add16 } from '@carbon/icons-react';
import './CarbonMarketOverview.scss';

const CarbonMarketOverview = ({ marketData = {} }) => {
  // Market symbols to display
  const symbols = ['SPY', 'QQQ', 'VIX', 'AAPL', 'BTC'];
  
  return (
    <div className="market-overview-container">
      <Grid>
        <Row>
          {symbols.map((symbol) => {
            const data = marketData[symbol] || { price: 0, change: 0 };
            const isPositive = data.change > 0;
            const isNegative = data.change < 0;
            const changeClass = isPositive ? 'positive-change' : isNegative ? 'negative-change' : '';
            
            return (
              <Column sm={4} md={4} lg={3} key={symbol}>
                <Tile className="market-tile">
                  <div className="market-symbol">{symbol}</div>
                  <div className="market-price">
                    ${data.price ? (symbol === 'BTC' ? Math.round(data.price).toLocaleString() : data.price.toFixed(2)) : 'Loading...'}
                  </div>
                  <div className={`market-change ${changeClass}`}>
                    {data.change ? `${isPositive ? '+' : ''}${data.change.toFixed(1)}%` : '0.0%'}
                  </div>
                </Tile>
              </Column>
            );
          })}
          
          <Column sm={4} md={4} lg={3}>
            <Button
              kind="tertiary"
              renderIcon={Add16}
              className="view-all-button"
            >
              View All Markets
            </Button>
          </Column>
        </Row>
      </Grid>
    </div>
  );
};

export default CarbonMarketOverview;
