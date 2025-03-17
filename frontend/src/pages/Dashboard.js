import React, { useState } from 'react';
import TradingDashboard from '../components/TradingDashboard';
import { useSocket } from '../context/SocketContext';
import '../styles/pages/dashboard.css';

const Dashboard = () => {
  const { connected, isOfflineMode, executeTrade } = useSocket();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isPaperTrading, setIsPaperTrading] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleTradingMode = () => {
    setIsPaperTrading(!isPaperTrading);
  };

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <TradingDashboard 
        executeTrade={executeTrade}
        connected={connected}
        isOfflineMode={isOfflineMode}
        isDarkMode={isDarkMode}
        isPaperTrading={isPaperTrading}
        toggleTheme={toggleTheme}
        toggleTradingMode={toggleTradingMode}
      />
    </div>
  );
};

export default Dashboard;
