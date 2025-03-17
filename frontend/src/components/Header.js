import React from 'react';
import { MarketTickers } from './MarketTickers';
import '../styles/Header.css';

export const Header = ({ isDarkMode, toggleTheme, isPaperTrading, toggleTradingMode }) => {
  console.log('Header.js: Rendering Header component');
  return (
    <header className="app-header">
      <div className="logo">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 13H13V16C13 16.55 12.55 17 12 17C11.45 17 11 16.55 11 16V13H8C7.45 13 7 12.55 7 12C7 11.45 7.45 11 8 11H11V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V11H16C16.55 11 17 11.45 17 12C17 12.55 16.55 13 16 13Z" fill="var(--accent-blue)" />
        </svg>
        <h1>Trade<span>Sync</span></h1>
      </div>
      <MarketTickers />
      <div className="header-actions">
        <label className="account-toggle">
          <input type="checkbox" checked={isPaperTrading} onChange={toggleTradingMode} />
          <span className="account-slider">
            <span className="paper">PAPER</span>
            <span className="live">LIVE</span>
          </span>
        </label>
        <label className="theme-toggle">
          <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
          <span className="theme-slider">
            <span className="dark">🌙</span>
            <span className="light">☀️</span>
          </span>
        </label>
        <div className="user-profile">
          <div className="user-avatar">
            <span>TS</span>
          </div>
          <div className="user-info">
            <div className="user-name">Alex</div>
            <div className="user-plan">Bot Builder</div>
          </div>
        </div>
      </div>
    </header>
  );
};
