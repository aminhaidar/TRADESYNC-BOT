import React from 'react';
import './LoadingState.css';

export const LoadingOverlay = ({ text = 'Loading...', subtext = 'Retrieving market data and insights' }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <div className="loading-text">{text}</div>
        <div className="loading-subtext">{subtext}</div>
        <div className="loading-progress">
          <div className="loading-progress-bar"></div>
        </div>
      </div>
    </div>
  );
};

export const CardLoadingState = ({ count = 3 }) => {
  return (
    <>
      {Array(count).fill(0).map((_, index) => (
        <div key={index} className="loading-placeholder card-loading"></div>
      ))}
    </>
  );
};

export const TextLoadingState = ({ lines = 3, variant = 'mixed' }) => {
  return (
    <>
      {Array(lines).fill(0).map((_, index) => {
        let className = 'text-loading';
        
        if (variant === 'mixed') {
          if (index % 3 === 0) className += ' narrow';
          if (index % 3 === 2) className += ' wide';
        } else if (variant === 'narrow') {
          className += ' narrow';
        } else if (variant === 'wide') {
          className += ' wide';
        }
        
        return <div key={index} className={className}></div>;
      })}
    </>
  );
};
