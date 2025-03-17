import React, { useEffect, useState } from 'react';

const MarketTicker = () => {
  const [marketData, setMarketData] = useState([
    { symbol: 'SPY', price: 538.72, change: 1.24, changePercent: 0.23 },
    { symbol: 'QQQ', price: 461.35, change: 2.18, changePercent: 0.47 },
    { symbol: 'AAPL', price: 178.45, change: -0.86, changePercent: -0.48 },
    { symbol: 'MSFT', price: 428.80, change: 3.25, changePercent: 0.76 },
    { symbol: 'TSLA', price: 173.60, change: -1.45, changePercent: -0.83 },
    { symbol: 'AMZN', price: 180.35, change: 1.28, changePercent: 0.71 },
    { symbol: 'NVDA', price: 920.14, change: 15.65, changePercent: 1.73 },
    { symbol: 'GOOGL', price: 155.87, change: 0.54, changePercent: 0.35 },
  ]);

  // In a real implementation, this would fetch live data
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate small price changes
      setMarketData(prevData => 
        prevData.map(item => {
          const changeAmount = (Math.random() - 0.5) * 2;
          const newPrice = parseFloat((item.price + changeAmount).toFixed(2));
          const newChange = parseFloat((item.change + changeAmount).toFixed(2));
          const newChangePercent = parseFloat((newChange / newPrice * 100).toFixed(2));
          
          return {
            ...item,
            price: newPrice,
            change: newChange,
            changePercent: newChangePercent
          };
        })
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="market-ticker">
      <div className="ticker-container">
        {marketData.map((item, index) => (
          <div key={index} className="ticker-item">
            <span className="ticker-symbol">{item.symbol}</span>
            <span className="ticker-price">${item.price.toFixed(2)}</span>
            <span className={`ticker-change ${item.change >= 0 ? 'positive' : 'negative'}`}>
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
            </span>
          </div>
        ))}
        {/* Duplicate items for endless scrolling effect */}
        {marketData.map((item, index) => (
          <div key={`dup-${index}`} className="ticker-item">
            <span className="ticker-symbol">{item.symbol}</span>
            <span className="ticker-price">${item.price.toFixed(2)}</span>
            <span className={`ticker-change ${item.change >= 0 ? 'positive' : 'negative'}`}>
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;
