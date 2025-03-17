import React from 'react';
import './OfflineNotice.css';

const OfflineNotice = () => {
  return (
    <div className="offline-notice">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
        <path d="M12 7L12 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 16L12 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span>Operating in offline mode - backend server not detected</span>
    </div>
  );
};

export default OfflineNotice;
