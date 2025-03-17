import React from 'react';
import '../styles/TradingSettings.css';

export const TradingSettings = () => {
  return (
    <div className="trading-settings-card">
      <div className="card-header">
        <h2 className="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06C19.09 10.76 19.03 10.46 18.95 10.17L20.68 8.99C20.81 8.89 20.85 8.7 20.76 8.54L18.91 5.46C18.82 5.29 18.64 5.21 18.47 5.28L16.48 6.1C16.01 5.73 15.51 5.42 14.95 5.19L14.58 3.09C14.55 2.9 14.39 2.75 14.2 2.75H10.8C10.61 2.75 10.45 2.9 10.42 3.09L10.05 5.19C9.49 5.42 8.99 5.73 8.52 6.1L6.53 5.28C6.35 5.21 6.17 5.29 6.09 5.46L4.24 8.54C4.15 8.7 4.19 8.89 4.32 8.99L6.05 10.17C5.97 10.46 5.91 10.76 5.87 11.06C5.83 11.36 5.8 11.67 5.8 12C5.8 12.33 5.82 12.64 5.87 12.94C5.91 13.24 5.97 13.54 6.05 13.83L4.32 15.01C4.19 15.11 4.15 15.3 4.24 15.46L6.09 18.54C6.18 18.7 6.36 18.78 6.53 18.72L8.52 17.9C8.99 18.27 9.49 18.58 10.05 18.81L10.42 20.91C10.45 21.1 10.61 21.25 10.8 21.25H14.2C14.39 21.25 14.55 21.1 14.58 20.91L14.95 18.81C15.51 18.58 16.01 18.27 16.48 17.9L18.47 18.72C18.65 18.79 18.83 18.7 18.91 18.54L20.76 15.46C20.85 15.3 20.81 15.11 20.68 15.01L18.95 13.83C19.03 13.54 19.09 13.24 19.14 12.94ZM12.5 15.5C10.57 15.5 9 13.93 9 12C9 10.07 10.57 8.5 12.5 8.5C14.43 8.5 16 10.07 16 12C16 13.93 14.43 15.5 12.5 15.5Z" fill="#f85149"/>
          </svg>
          Trading Settings
          <span className="badge badge-active">Active</span>
        </h2>
      </div>
      
      <div className="settings-item">
        <div className="settings-item-header">
          <div className="settings-label">Alpaca API Connected</div>
          <label className="switch">
            <input type="checkbox" checked onChange={() => {}} />
            <span className="switch-slider"></span>
          </label>
        </div>
      </div>
      
      <div className="settings-list">
        <div className="settings-item">
          <div className="settings-label">Position Sizing</div>
          <div className="settings-value">Dynamic (5% max)</div>
        </div>
        <div className="settings-item">
          <div className="settings-label">Entry Timing</div>
          <div className="settings-value">Volume-based</div>
        </div>
        <div className="settings-item">
          <div className="settings-label">Stop Loss</div>
          <div className="settings-value">Auto (from source)</div>
        </div>
        <div className="settings-item">
          <div className="settings-label">Take Profit</div>
          <div className="settings-value">Tiered (50%, 75%, 100%)</div>
        </div>
        <div className="settings-item">
          <div className="settings-label">AI Confidence Threshold</div>
          <div className="settings-value">75%</div>
        </div>
      </div>
      
      <button className="btn settings-btn">Advanced Settings</button>
    </div>
  );
};
