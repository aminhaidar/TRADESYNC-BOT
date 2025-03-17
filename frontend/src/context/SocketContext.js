import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

// Create the socket context
export const SocketContext = createContext();

// Create a single instance outside component lifecycle
let socketInstance = null;

export const SocketProvider = ({ children, refreshData }) => {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Only create a socket if one doesn't already exist
    if (!socketInstance) {
      console.log('Creating new socket connection...');
      
      // EXPLICITLY use port 5001
      const SOCKET_SERVER_URL = 'http://localhost:5001';
      console.log('SocketContext: Attempting to connect to', SOCKET_SERVER_URL);
      
      socketInstance = io(SOCKET_SERVER_URL, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: true,
        transports: ['websocket', 'polling']
      });
      
      // Make socket globally available
      window.socket = socketInstance;

      socketInstance.on('connect', () => {
        console.log('SocketContext: Connected to server with ID:', socketInstance.id);
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('SocketContext: Disconnected from server');
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (err) => {
        console.error('SocketContext: Connection error:', err.message);
        setIsConnected(false);
      });

      socketInstance.on('live_trade_update', (data) => {
        console.log('SocketContext: Received trade update:', data);
        if (refreshData) {
          refreshData();
        }
      });
    }

    // Cleanup function for component unmount
    return () => {
      // We don't disconnect the socket here to keep the connection alive
      // This prevents the StrictMode double-mount issue
    };
  }, [refreshData]); 

  // Add a cleanup effect for when the app truly unmounts
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socketInstance) {
        console.log('Application closing, disconnecting socket');
        socketInstance.disconnect();
        socketInstance = null;
        window.socket = null;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const executeTrade = (tradeData) => {
    if (socketInstance && isConnected) {
      console.log('SocketContext: Executing trade:', tradeData);
      socketInstance.emit('execute_trade', tradeData);
      return true;
    } else {
      console.error('SocketContext: Cannot execute trade - socket not connected');
      return false;
    }
  };

  return (
    <SocketContext.Provider value={{ socket: socketInstance, isConnected, executeTrade }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
