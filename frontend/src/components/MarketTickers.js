import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/MarketTickers.css';

export const MarketTickers = () => {
  console.log('MarketTickers.js: Rendering MarketTickers component');
  const [tickers, setTickers] = useState([
    { name: 'SPY', value: 483.27, change: 1.24, isPositive: true },
    { name: 'QQQ', value: 414.93, change: 1.87, isPositive: true },
    { name: 'VIX', value: 17.28, change: -5.36, isPositive: false },
  ]);
  const [showAllTickers, setShowAllTickers] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickers(prevTickers =>
        prevTickers.map(ticker => {
          const randomChange = (Math.random() * 0.2 - 0.1).toFixed(2);
          const newValue = (ticker.value * (1 + parseFloat(randomChange) / 100)).toFixed(2);
          const newChange = parseFloat((ticker.change + parseFloat(randomChange)).toFixed(2));
          return {
            ...ticker,
            value: parseFloat(newValue),
            change: newChange,
            isPositive: newChange >= 0,
          };
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const additionalTickers = [
    { name: 'AAPL', value: 189.84, change: 0.87, isPositive: true },
    { name: 'MSFT', value: 421.73, change: 1.29, isPositive: true },
    { name: 'BTC', value: 68452.12, change: -2.34, isPositive: false },
  ];

  const displayTickers = showAllTickers ? [...tickers, ...additionalTickers] : tickers;

  return (
    <div className="market-tickers-container">
      <div className="market-tickers">
        <AnimatePresence>
          {displayTickers.map(ticker => (
            <motion.div
              key={ticker.name}
              className="ticker"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <span className="ticker-name">{ticker.name}</span>
              <span className="ticker-value">{ticker.value}</span>
              <span className={`ticker-change ${ticker.isPositive ? 'positive' : 'negative'}`}>
                {ticker.isPositive ? '+' : ''}{ticker.change}%
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <button
        className="expand-tickers-btn"
        onClick={() => setShowAllTickers(!showAllTickers)}
      >
        {showAllTickers ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z" fill="currentColor" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
};
