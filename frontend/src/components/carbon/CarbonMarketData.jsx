import React from 'react';
import { useSocket } from '../../contexts/SocketContext';
import './CarbonMarketData.scss';

const CarbonMarketData = () => {
  const { marketData } = useSocket();
  
  // Symbols to display
  const symbols = ['SPY', 'QQQ', 'VIX', 'AAPL', 'BTC'];

  // Mock data matching the screenshot - use if no real data
  const mockData = {
    SPY: { symbol: 'SPY', price: 483.58, change: 1.5 },
    QQQ: { symbol: 'QQQ', price: 418.27, change: 1.7 },
    VIX: { symbol: 'VIX', price: 14.77, change: -5.2 },
    AAPL: { symbol: 'AAPL', price: 213.18, change: 0.8 },
    BTC: { symbol: 'BTC', price: 68474, change: 2.5 }
  };

  const getData = (symbol) => {
    return marketData[symbol] || mockData[symbol] || { price: 0, change: 0 };
  };

  return (
    <div className="market-data-container">
      {symbols.map(symbol => {
        const data = getData(symbol);
        const isPositive = data.change > 0;
        const isNegative = data.change < 0;
        
        return (
          <div className="market-card" key={symbol}>
            <div className="symbol">{symbol}</div>
            <div className="price">
              ${data.price ? 
                (symbol === 'BTC' ? Math.round(data.price).toLocaleString() : data.price.toFixed(2)) 
                : '0.00'}
            </div>
            <div className={`change ${isPositive ? 'positive' : isNegative ? 'negative' : ''}`}>
              {isPositive ? '+' : ''}{data.change.toFixed(1)}%
            </div>
          </div>
        );
      })}
      
      <div className="view-all-card">
        <span>View All Markets</span>
      </div>
    </div>
  );
};

export default CarbonMarketData;
