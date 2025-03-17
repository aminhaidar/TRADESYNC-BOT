import React from 'react';
import TradeSyncDashboard from './components/TradeSyncDashboard';
import { SocketProvider } from './context/SocketContext';
import './App.css';

function App() {
  const refreshData = () => {
    console.log('App: Refreshing data due to socket event');
  };

  return (
    <SocketProvider refreshData={refreshData}>
      <TradeSyncDashboard />
    </SocketProvider>
  );
}

export default App;
