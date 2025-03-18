import React, { useState, useEffect } from 'react';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './components/dashboard/Dashboard';
import socketService from './services/socketService';
import './App.css';

function App() {
  const [marketData, setMarketData] = useState({
    SPY: { symbol: 'SPY', price: 483.48, change: 1.8 },
    QQQ: { symbol: 'QQQ', price: 418.39, change: 2.2 },
    VIX: { symbol: 'VIX', price: 14.71, change: -5.3 },
    AAPL: { symbol: 'AAPL', price: 213.25, change: 0.8 },
    BTC: { symbol: 'BTC', price: 68480, change: 2.5 }
  });
  
  const [positions, setPositions] = useState([
    { 
      id: 1, 
      symbol: 'AAPL', 
      type: 'stock', 
      quantity: 10, 
      entryPrice: 211.80, 
      currentPrice: 213.25, 
      costBasis: 2118.00, 
      plValue: 14.50, 
      plPercent: 0.7, 
      isProfit: true,
      dayChange: 0.8
    },
    { 
      id: 2, 
      symbol: 'TSLA', 
      type: 'stock', 
      quantity: 15, 
      entryPrice: 180.50, 
      currentPrice: 177.82, 
      costBasis: 2707.50, 
      plValue: -40.20, 
      plPercent: -1.5, 
      isProfit: false,
      dayChange: -1.6
    },
    { 
      id: 3, 
      symbol: 'SPY 490C 03/29/25', 
      type: 'option', 
      quantity: 5, 
      entryPrice: 4.30, 
      currentPrice: 4.88, 
      costBasis: 2150.00, 
      plValue: 290.00, 
      plPercent: 13.5, 
      isProfit: true,
      dayChange: 6.2
    }
  ]);
  
  const [accountSummary, setAccountSummary] = useState({
    totalValue: 52490.40,
    availableCash: 37886.99,
    openPL: 509.59,
    closedPL: 774.51
  });
  
  const [performanceData, setPerformanceData] = useState([
    { date: 'Jan', value: 48000 },
    { date: 'Feb', value: 47500 },
    { date: 'Mar', value: 49000 },
    { date: 'Apr', value: 48500 },
    { date: 'May', value: 50000 },
    { date: 'Jun', value: 51000 },
    { date: 'Jul', value: 50500 },
    { date: 'Aug', value: 51500 },
    { date: 'Sep', value: 52000 },
    { date: 'Oct', value: 51800 },
    { date: 'Nov', value: 52200 },
    { date: 'Dec', value: 52490 }
  ]);
  
  const [tradingStats, setTradingStats] = useState({
    winRate: 78,
    winCount: 21,
    totalTrades: 27,
    averageGain: 14.2,
    averageLoss: 8.6
  });
  
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    console.log('App: Initializing');
    
    // Handle connection status updates
    const unsubscribe = socketService.onConnectionStatus(status => {
      console.log(`App: Connection status changed to ${status}`);
      setConnectionStatus(status);
      
      // If we just connected, request initial data
      if (status === 'connected') {
        console.log('App: Requesting initial data');
        socketService.emit('getMarketData');
        socketService.emit('getPositions');
        socketService.emit('getAccountSummary');
      }
    });
    
    // Register event listeners
    const marketDataUnsubscribe = socketService.on('marketData', (data) => {
      console.log('App: Received market data');
      setMarketData(prevData => ({
        ...prevData,
        ...data
      }));
    });
    
    const positionsUnsubscribe = socketService.on('positions', (data) => {
      console.log('App: Received positions');
      setPositions(data);
    });
    
    const accountSummaryUnsubscribe = socketService.on('accountSummary', (data) => {
      console.log('App: Received account summary');
      setAccountSummary(data);
    });
    
    // Connect to the server
    console.log('App: Connecting to socket server');
    socketService.connect();
    
    // Clean up event listeners on unmount
    return () => {
      console.log('App: Cleaning up');
      unsubscribe();
      marketDataUnsubscribe();
      positionsUnsubscribe();
      accountSummaryUnsubscribe();
    };
  }, []);

  return (
    <div className="App">
      <AppLayout connectionStatus={connectionStatus}>
        <Dashboard 
          marketData={marketData}
          positions={positions}
          accountSummary={accountSummary}
          performanceData={performanceData}
          tradingStats={tradingStats}
        />
      </AppLayout>
    </div>
  );
}

export default App;
