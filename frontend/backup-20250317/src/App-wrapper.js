import React from 'react';
import { SocketProvider } from './context/SocketContext';
import TradeSyncDashboardWrapper from './components/TradeSyncDashboardWrapper';
import './styles/carbon-theme.scss'; // Import Carbon theme

function App() {
  return (
    <SocketProvider>
      <TradeSyncDashboardWrapper />
    </SocketProvider>
  );
}

export default App;
