import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

// Create context
const SocketContext = createContext();

// Hook to use the socket
export const useSocket = () => useContext(SocketContext);

// Provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  
  useEffect(() => {
    // Important: Hardcoded URL to prevent any issues
    const socketUrl = 'http://localhost:5001';
    console.log('Creating socket connection to:', socketUrl);
    
    const newSocket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: true
    });
    
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
    });
    
    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });
    
    newSocket.on('live_trade_update', (data) => {
      console.log('Received trade update:', data);
      setLastMessage(data);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    return () => {
      console.log('Cleaning up socket connection');
      newSocket.disconnect();
    };
  }, []);
  
  const sendMessage = (event, data) => {
    if (socket && isConnected) {
      console.log(`Sending ${event}:`, data);
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot send message');
    }
  };
  
  return (
    <SocketContext.Provider value={{ socket, isConnected, lastMessage, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
