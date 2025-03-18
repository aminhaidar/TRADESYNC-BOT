import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    // Connection config
    const socketOptions = {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000
    };
    
    // Create socket instance
    const socketInstance = io('http://localhost:5001', socketOptions);
    
    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server');
      setConnectionStatus('connected');
      setConnectionError(null);
      setReconnectAttempts(0);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnectionStatus('error');
      setConnectionError(error.message);
      setReconnectAttempts(prev => prev + 1);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
      setConnectionStatus('disconnected');
      
      // If server closed connection, try to reconnect
      if (reason === 'io server disconnect') {
        socketInstance.connect();
      }
    });
    
    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnect attempt ${attemptNumber}`);
      setConnectionStatus('reconnecting');
      setReconnectAttempts(attemptNumber);
    });
    
    socketInstance.on('reconnect_failed', () => {
      console.log('Failed to reconnect to server');
      setConnectionStatus('failed');
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
      socketInstance.off('connect');
      socketInstance.off('connect_error');
      socketInstance.off('disconnect');
      socketInstance.off('reconnect_attempt');
      socketInstance.off('reconnect_failed');
    };
  }, []);

  return (
    <SocketContext.Provider value={{ 
      socket, 
      connectionStatus, 
      connectionError,
      reconnectAttempts
    }}>
      {children}
    </SocketContext.Provider>
  );
};
