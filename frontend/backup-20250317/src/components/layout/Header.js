import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="header-title">
        <h1>TradeSync Bot</h1>
      </div>
      
      <div className="header-controls">
        <button className="btn">Refresh</button>
        <button className="btn">Settings</button>
      </div>
    </header>
  );
};

export default Header;
