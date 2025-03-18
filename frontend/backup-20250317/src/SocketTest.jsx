import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketTest = () => {
  const [status, setStatus] = useState('Initializing...');
  const [messages, setMessages] = useState([]);
  const [marketData, setMarketData] = useState({});

  // Add a debug message
  const addMessage = (msg) => {
    setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    addMessage('Creating socket connection...');
    
    // Create socket with explicit path
    const socket = io('http://localhost:5001', {
      transports: ['websocket', 'polling'],
      path: '/socket.io/', // Explicitly set the path
      reconnectionAttempts: 3,
      timeout: 10000
    });
    
    socket.on('connect', () => {
      addMessage('Socket connected!');
      setStatus('Connected');
    });
    
    socket.on('connect_error', (err) => {
      addMessage(`Connection error: ${err.message}`);
      setStatus(`Error: ${err.message}`);
    });
    
    socket.on('disconnect', (reason) => {
      addMessage(`Disconnected: ${reason}`);
      setStatus(`Disconnected: ${reason}`);
    });
    
    socket.on('marketData', (data) => {
      addMessage(`Received market data: ${data.symbol} = $${data.price}`);
      setMarketData(prev => ({...prev, [data.symbol]: data}));
    });
    
    socket.on('accountSummary', (data) => {
      addMessage(`Received account data: Total value = $${data.totalValue}`);
    });
    
    // Clean up
    return () => {
      addMessage('Cleaning up socket connection');
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#131722', color: 'white' }}>
      <h1>Socket.io Connection Test</h1>
      
      <div style={{ 
        padding: '10px', 
        backgroundColor: status === 'Connected' ? '#004400' : '#440000', 
        borderRadius: '5px', 
        marginBottom: '20px'
      }}>
        Status: {status}
      </div>
      
      {Object.keys(marketData).length > 0 && (
        <div>
          <h2>Received Market Data</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {Object.entries(marketData).map(([symbol, data]) => (
              <div key={symbol} style={{ 
                padding: '15px', 
                backgroundColor: '#1E2536', 
                borderRadius: '8px',
                minWidth: '150px' 
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{symbol}</div>
                <div style={{ fontSize: '22px', margin: '10px 0' }}>${data.price.toFixed(2)}</div>
                <div style={{ 
                  display: 'inline-block',
                  padding: '5px 10px',
                  backgroundColor: data.change >= 0 ? 'rgba(0, 207, 146, 0.2)' : 'rgba(255, 87, 87, 0.2)',
                  color: data.change >= 0 ? '#00CF92' : '#FF5757',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}>
                  {data.change >= 0 ? '+' : ''}{data.change}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <h2>Event Log:</h2>
      <pre style={{ 
        backgroundColor: '#000', 
        padding: '1rem', 
        borderRadius: '4px',
        maxHeight: '500px',
        overflow: 'auto',
        fontSize: '14px',
        fontFamily: 'monospace'
      }}>
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </pre>
    </div>
  );
};

export default SocketTest;
