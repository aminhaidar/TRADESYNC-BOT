import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const App = () => {
  // State for our components
  const [marketData, setMarketData] = useState({
    SPY: { symbol: 'SPY', price: 483.58, change: 1.5 },
    QQQ: { symbol: 'QQQ', price: 418.27, change: 1.7 },
    VIX: { symbol: 'VIX', price: 14.77, change: -5.2 },
    AAPL: { symbol: 'AAPL', price: 213.18, change: 0.8 },
    BTC: { symbol: 'BTC', price: 68474, change: 2.5 }
  });
  
  const [positions, setPositions] = useState([
    {
      id: 'aapl-stock',
      type: 'stock',
      symbol: 'AAPL',
      quantity: 10,
      entryPrice: 211.80,
      currentPrice: 211.54,
      costBasis: 2118.00,
      plValue: 171.37,
      plPercent: 8.0,
      dayChange: 0.8,
      isProfit: true
    },
    {
      id: 'tsla-stock',
      type: 'stock',
      symbol: 'TSLA',
      quantity: 15,
      entryPrice: 180.50,
      currentPrice: 177.46,
      costBasis: 2707.50,
      plValue: -39.60,
      plPercent: -1.6,
      dayChange: -0.5,
      isProfit: false
    },
    {
      id: 'spy-options',
      type: 'option',
      symbol: 'SPY 490C 03/29/25',
      quantity: 5,
      entryPrice: 4.30,
      currentPrice: 4.85,
      costBasis: 2150.00,
      plValue: 274.13,
      plPercent: 12.8,
      dayChange: 1.2,
      isProfit: true
    }
  ]);
  
  const [accountSummary, setAccountSummary] = useState({
    totalValue: 52478.54,
    availableCash: 37888.38,
    openPL: 511.76,
    closedPL: 776.78
  });
  
  const [expandedPositions, setExpandedPositions] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [socketConnected, setSocketConnected] = useState(false);

  // Socket connection for real-time data
  useEffect(() => {
    let socket;
    
    try {
      // Create socket connection
      socket = io('http://localhost:5001', {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5
      });
      
      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        setConnectionStatus('connected');
        setSocketConnected(true);
        
        // Request initial data
        socket.emit('getMarketData');
        socket.emit('getPositions');
        socket.emit('getAccountSummary');
      });
      
      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setConnectionStatus('error');
        setSocketConnected(false);
      });
      
      socket.on('marketData', (data) => {
        if (data && data.symbol) {
          setMarketData(prev => ({...prev, [data.symbol]: data}));
        }
      });
      
      socket.on('positions', (data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPositions(data);
        }
      });
      
      socket.on('accountSummary', (data) => {
        if (data) {
          setAccountSummary(data);
        }
      });
    } catch (error) {
      console.error('Socket initialization error:', error);
      setConnectionStatus('error');
      setSocketConnected(false);
    }
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);
  
  // Function to toggle expanded position details
  const togglePosition = (id) => {
    setExpandedPositions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle trade button click
  const handleNewTrade = () => {
    alert('New Trade button clicked. This would open the trade form in a real implementation.');
  };

  // Format number safely
  const formatNumber = (value, decimals = 2) => {
    if (value === undefined || value === null) return '0.00';
    return typeof value === 'number' ? value.toFixed(decimals) : '0.00';
  };

  // Format currency
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '$0.00';
    return typeof value === 'number' ? 
      `$${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}` : '$0.00';
  };

  return (
    <div style={{ 
      backgroundColor: '#0D1117', 
      color: '#F6F8FA', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px'
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>TradeSync Dashboard</h1>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#161B22',
            padding: '6px 12px',
            borderRadius: '16px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: connectionStatus === 'connected' ? '#3FB950' : 
                              connectionStatus === 'error' ? '#F85149' : '#F5A623'
            }}></div>
            <span style={{ fontSize: '12px', color: '#8B949E' }}>
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'error' ? 'Connection Error' : 'Connecting...'}
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            background: '#161B22',
            borderRadius: '16px',
            padding: '2px'
          }}>
            <button style={{
              border: 'none',
              background: '#F5A623',
              color: '#0D1117',
              borderRadius: '16px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 'bold',
              marginRight: '2px'
            }}>PAPER</button>
            <button style={{
              border: 'none',
              background: 'transparent',
              color: '#8B949E',
              borderRadius: '16px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>LIVE</button>
          </div>
        </div>
      </header>
      
      {/* Market Data Section */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {Object.values(marketData || {}).map(data => {
          if (!data || !data.symbol) return null;
          
          return (
            <div key={data.symbol} style={{
              backgroundColor: '#161B22',
              borderRadius: '12px',
              padding: '16px',
              minHeight: '80px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ 
                fontWeight: '600',
                fontSize: '14px',
                color: '#F6F8FA',
                marginBottom: '4px'
              }}>{data.symbol}</div>
              <div style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#F6F8FA',
                marginBottom: '8px'
              }}>
                {data.symbol === 'BTC' ? 
                  `$${Math.round(data.price || 0).toLocaleString()}` : 
                  `$${formatNumber(data.price)}`}
              </div>
              <div style={{
                alignSelf: 'flex-start',
                fontSize: '12px',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: (data.change > 0) ? 'rgba(63, 185, 80, 0.1)' : 
                                 (data.change < 0) ? 'rgba(248, 81, 73, 0.1)' : 'transparent',
                color: (data.change > 0) ? '#3FB950' : 
                      (data.change < 0) ? '#F85149' : '#F6F8FA'
              }}>
                {(data.change > 0) ? '+' : ''}{formatNumber(data.change, 1)}%
              </div>
            </div>
          );
        })}
        
        <div style={{
          backgroundColor: '#161B22',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8B949E',
          fontSize: '14px',
          border: '1px solid #30363D',
          cursor: 'pointer'
        }}>View All Markets</div>
      </div>
      
      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px'
      }}>
        {/* Positions Section */}
        <div style={{
          backgroundColor: '#161B22',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: '600',
              margin: '0',
              color: '#F6F8FA'
            }}>Open Positions</h2>
            
            <button 
              style={{
                backgroundColor: '#388BFD',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }} 
              onClick={handleNewTrade}
            >
              New Trade
            </button>
          </div>
          
          <div>
            {positions.map(position => {
              if (!position || !position.id) return null;
              
              return (
                <div 
                  key={position.id} 
                  style={{
                    backgroundColor: '#1C2129',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    overflow: 'hidden',
                    position: 'relative',
                    borderLeft: `4px solid ${position.isProfit ? '#3FB950' : '#F85149'}`
                  }}
                >
                  <div 
                    style={{
                      display: 'flex',
                      padding: '16px',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => togglePosition(position.id)}
                  >
                    <div style={{ minWidth: '120px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '500',
                        backgroundColor: position.type === 'option' ? 'rgba(245, 166, 35, 0.1)' : 'rgba(56, 139, 253, 0.1)',
                        color: position.type === 'option' ? '#F5A623' : '#388BFD'
                      }}>
                        {position.type === 'option' ? position.symbol : `${position.symbol} Stock`}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', flex: '1', gap: '24px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', color: '#8B949E', marginBottom: '4px' }}>Quantity</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#F6F8FA' }}>{position.quantity}</span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', color: '#8B949E', marginBottom: '4px' }}>Entry Price</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#F6F8FA' }}>${formatNumber(position.entryPrice)}</span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', color: '#8B949E', marginBottom: '4px' }}>Current Price</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#F6F8FA' }}>${formatNumber(position.currentPrice)}</span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', color: '#8B949E', marginBottom: '4px' }}>Cost Basis</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#F6F8FA' }}>${formatNumber(position.costBasis)}</span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', color: '#8B949E', marginBottom: '4px' }}>P/L ($)</span>
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: '500', 
                          color: position.isProfit ? '#3FB950' : '#F85149' 
                        }}>
                          {position.isProfit ? '+' : ''}{formatNumber(position.plValue)}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', color: '#8B949E', marginBottom: '4px' }}>P/L (%)</span>
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: '500', 
                          color: position.isProfit ? '#3FB950' : '#F85149' 
                        }}>
                          {position.isProfit ? '+' : ''}{formatNumber(position.plPercent, 1)}%
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', color: '#8B949E', marginBottom: '4px' }}>Day's P/L</span>
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: '500', 
                          color: (position.dayChange >= 0) ? '#3FB950' : '#F85149' 
                        }}>
                          {(position.dayChange >= 0) ? '+' : ''}{formatNumber(position.dayChange, 1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ marginLeft: '8px' }}>
                      <button style={{
                        background: 'none',
                        border: '1px solid #30363D',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          width: '10px',
                          height: '10px',
                          position: 'relative'
                        }}>
                          <span style={{
                            position: 'absolute',
                            width: '8px',
                            height: '2px',
                            backgroundColor: '#8B949E',
                            transform: `rotate(${expandedPositions[position.id] ? '45' : '-45'}deg)`,
                            left: '0',
                            top: '4px'
                          }}></span>
                          <span style={{
                            position: 'absolute',
                            width: '8px',
                            height: '2px',
                            backgroundColor: '#8B949E',
                            transform: `rotate(${expandedPositions[position.id] ? '-45' : '45'}deg)`,
                            right: '0',
                            top: '4px'
                          }}></span>
                        </span>
                      </button>
                    </div>
                  </div>
                  
                  {expandedPositions[position.id] && (
                    <div style={{
                      padding: '0 16px 16px 16px',
                      marginLeft: '16px'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '8px'
                      }}>
                        <button style={{
                          backgroundColor: '#3FB950',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}>Buy More</button>
                        
                        <button style={{
                          backgroundColor: 'transparent',
                          color: '#F85149',
                          border: '1px solid #F85149',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}>Sell Position</button>
                        
                        <button style={{
                          backgroundColor: 'transparent',
                          color: '#8B949E',
                          border: '1px solid #30363D',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}>View Details</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Account Summary Section */}
        <div style={{
          backgroundColor: '#161B22',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            margin: '0 0 16px 0',
            color: '#F6F8FA'
          }}>Account Summary</h2>
          
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#F6F8FA',
            marginBottom: '20px'
          }}>
            {formatCurrency(accountSummary.totalValue)}
          </div>
          
          <div style={{
            backgroundColor: '#1C2129',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <div style={{ color: '#8B949E' }}>Available Cash</div>
            <div style={{ color: '#F6F8FA' }}>
              {formatCurrency(accountSummary.availableCash)}
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <div style={{
              backgroundColor: '#1C2129',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <div style={{ color: '#8B949E' }}>Open P/L</div>
              <div style={{ color: (accountSummary.openPL >= 0) ? '#3FB950' : '#F85149' }}>
                {(accountSummary.openPL >= 0) ? '+' : ''}${Math.abs(accountSummary.openPL || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#1C2129',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <div style={{ color: '#8B949E' }}>Closed P/L</div>
              <div style={{ color: (accountSummary.closedPL >= 0) ? '#3FB950' : '#F85149' }}>
                {(accountSummary.closedPL >= 0) ? '+' : ''}${Math.abs(accountSummary.closedPL || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
