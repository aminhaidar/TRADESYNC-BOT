import React, { useEffect, useState } from 'react';

const MockDataComponent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [mockData, setMockData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Test the server is accessible with a simple fetch first
    fetch('http://localhost:5001')
      .then(response => {
        console.log('Server responded:', response.status);
        setIsConnected(true);
      })
      .catch(err => {
        console.error('Server connection test failed:', err);
        setError(`Connection test failed: ${err.message}`);
      });
      
    // Also display some mock data (since we don't need Socket.io for this test)
    const demoData = {
      SPY: { price: 483.48, change: 1.8 },
      QQQ: { price: 418.39, change: 2.2 },
      VIX: { price: 14.71, change: -5.3 },
      AAPL: { price: 213.25, change: 0.8 },
      BTC: { price: 68480, change: 2.5 }
    };
    
    setMockData(demoData);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#131722', color: 'white' }}>
      <h1>Connection Test</h1>
      
      <div style={{ padding: '10px', backgroundColor: isConnected ? '#004400' : '#440000', borderRadius: '5px', marginBottom: '20px' }}>
        Status: {isConnected ? 'Connected to server' : 'Not connected'}
        {error && <div style={{ color: '#ff6666', marginTop: '10px' }}>{error}</div>}
      </div>
      
      <h2>Mock Market Data</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {mockData && Object.entries(mockData).map(([symbol, data]) => (
          <div key={symbol} style={{ 
            padding: '15px', 
            backgroundColor: '#1E2536', 
            borderRadius: '8px',
            minWidth: '150px' 
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{symbol}</div>
            <div style={{ fontSize: '22px', margin: '10px 0' }}>${typeof data.price === 'number' ? data.price.toFixed(2) : data.price}</div>
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
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#999' }}>
        Note: This component shows mock data without Socket.io to test basic rendering.
      </div>
    </div>
  );
};

export default MockDataComponent;
