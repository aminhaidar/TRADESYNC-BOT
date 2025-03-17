import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

// HARDCODED URL
const BACKEND_URL = 'http://localhost:5001';
console.log('HARDCODED BACKEND URL:', BACKEND_URL);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    console.log(`Creating brand new socket connection to: ${BACKEND_URL}`);
    
    // Create socket
    const newSocket = io(BACKEND_URL, {
      forceNew: true,
      transports: ['polling', 'websocket']
    });
    
    setSocket(newSocket);
    
    // Socket events
    newSocket.on('connect', () => {
      console.log('Successfully connected to socket server:', newSocket.id);
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
    
    newSocket.on('connection_response', (data) => {
      console.log('Connection response:', data);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    // Cleanup
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
