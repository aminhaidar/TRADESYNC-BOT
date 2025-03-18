import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [marketData, setMarketData] = useState({});
  const [positions, setPositions] = useState([]);
  const [accountSummary, setAccountSummary] = useState({
    totalValue: 52478.54,
    availableCash: 37888.382,
    openPL: 511.762,
    closedPL: 776.78
  });

  useEffect(() => {
    const socketOptions = {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling']
    };
    
    const socketInstance = io('http://localhost:5001', socketOptions);
    
    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server');
      setConnectionStatus('connected');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnectionStatus('error');
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
      setConnectionStatus('disconnected');
    });
    
    socketInstance.on('marketData', (data) => {
      setMarketData(prev => ({...prev, [data.symbol]: data}));
    });
    
    socketInstance.on('positions', (data) => {
      setPositions(data);
    });
    
    socketInstance.on('accountSummary', (data) => {
      setAccountSummary(data);
    });

    setSocket(socketInstance);
    
    // Request initial data
    socketInstance.emit('getMarketData');
    socketInstance.emit('getPositions');
    socketInstance.emit('getAccountSummary');

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ 
      socket, 
      connectionStatus, 
      marketData, 
      positions, 
      accountSummary 
    }}>
      {children}
    </SocketContext.Provider>
  );
};
