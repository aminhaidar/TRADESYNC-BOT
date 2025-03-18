import React, { useState, useEffect, useRef } from 'react';
import './TradeSyncDashboard.css';

const TradeSyncDashboard = () => {
  const [expandedPosition, setExpandedPosition] = useState(null);
  const wsRef = useRef(null);
  const cryptoWsRef = useRef(null);
  
  // API key references - hardcoded for development only
  // IMPORTANT: For production, these should be secure environment variables
  const API_KEY = 'PKJ4SXESMNL2TC496B2J';
  const API_SECRET = 'ehqd4WyctmQzjI7qsNL2lo9fQsu5d3jFUd1UReK4';
  
  // Initialize data states
  const [marketData, setMarketData] = useState({
    SPY: { symbol: 'SPY', price: 483.58, change: 1.8 },
    QQQ: { symbol: 'QQQ', price: 418.27, change: 1.7 },
    VIX: { symbol: 'VIX', price: 14.77, change: -5.2 },
    AAPL: { symbol: 'AAPL', price: 213.18, change: 0.8 },
    BTC: { symbol: 'BTC', price: 68474, change: 2.5 }
  });
  
  const [positions, setPositions] = useState([
    { 
      id: 'aapl', 
      symbol: 'AAPL', 
      type: 'stock', 
      quantity: 10, 
      entryPrice: 211.80, 
      currentPrice: 213.25, 
      costBasis: 2118.00, 
      plValue: 14.50, 
      plPercent: 0.7, 
      dayChange: 0.8
    },
    { 
      id: 'tsla', 
      symbol: 'TSLA', 
      type: 'stock', 
      quantity: 15, 
      entryPrice: 180.50, 
      currentPrice: 177.82,
      costBasis: 2707.50, 
      plValue: -40.20, 
      plPercent: -1.5, 
      dayChange: -1.6
    },
    { 
      id: 'spy', 
      symbol: 'SPY 490C 03/29/25', 
      type: 'option', 
      quantity: 5, 
      entryPrice: 4.30, 
      currentPrice: 4.88, 
      costBasis: 2150.00, 
      plValue: 290.00, 
      plPercent: 13.5, 
      dayChange: 6.2
    }
  ]);
  
  const [accountSummary, setAccountSummary] = useState({
    totalValue: 52490.40,
    availableCash: 37886.99,
    openPL: 509.59,
    closedPL: 774.51
  });

  const [connectionStatus, setConnectionStatus] = useState('connected');

  const togglePosition = (id) => {
    setExpandedPosition(expandedPosition === id ? null : id);
  };

  // Function to handle scaling a position
  const handleScale = (positionId, percentage) => {
    console.log(`Scaling position ${positionId} by ${percentage}%`);
    // Here you would implement the actual scaling logic
  };

  // Helper function for formatting currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Helper function for formatting percentages
  const formatPercentage = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      signDisplay: 'exceptZero'
    }).format(value / 100);
  };

  // Function to connect to Alpaca API for account data
  useEffect(() => {
    const fetchAlpacaData = async () => {
      try {
        // Using hardcoded API keys
        if (!API_KEY || !API_SECRET) {
          console.warn('Alpaca API keys not found');
          return;
        }
        
        const response = await fetch('https://paper-api.alpaca.markets/v2/account', {
          headers: {
            'APCA-API-KEY-ID': API_KEY,
            'APCA-API-SECRET-KEY': API_SECRET
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const accountData = await response.json();
        console.log('Account data:', accountData);
        
        // Update account summary with real data
        setAccountSummary({
          totalValue: parseFloat(accountData.portfolio_value),
          availableCash: parseFloat(accountData.cash),
          openPL: parseFloat(accountData.equity) - parseFloat(accountData.last_equity),
          closedPL: parseFloat(accountData.realized_pl || 0)
        });
        
        // Fetch positions
        const positionsResponse = await fetch('https://paper-api.alpaca.markets/v2/positions', {
          headers: {
            'APCA-API-KEY-ID': API_KEY,
            'APCA-API-SECRET-KEY': API_SECRET
          }
        });
        
        if (!positionsResponse.ok) {
          throw new Error(`HTTP error! status: ${positionsResponse.status}`);
        }
        
        const positionsData = await positionsResponse.json();
        console.log('Positions data:', positionsData);
        
        // Transform positions data to our format
        if (Array.isArray(positionsData)) {
          const formattedPositions = positionsData.map(position => ({
            id: position.asset_id || position.symbol.toLowerCase(),
            symbol: position.symbol,
            type: 'stock', // Alpaca doesn't provide this directly, so we assume stock
            quantity: parseFloat(position.qty),
            entryPrice: parseFloat(position.avg_entry_price),
            currentPrice: parseFloat(position.current_price),
            costBasis: parseFloat(position.cost_basis),
            plValue: parseFloat(position.unrealized_pl),
            plPercent: parseFloat(position.unrealized_plpc) * 100,
            dayChange: parseFloat(position.unrealized_intraday_plpc) * 100
          }));
          
          setPositions(formattedPositions);
        }
        
      } catch (error) {
        console.error('Error fetching data from Alpaca:', error);
        setConnectionStatus('error');
      }
    };
    
    fetchAlpacaData();
    
    // Set up a timer to periodically refresh data
    const intervalId = setInterval(fetchAlpacaData, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Connect to Alpaca WebSocket for real-time market data
  useEffect(() => {
    const connectWebSocket = () => {
      // Using hardcoded API keys
      if (!API_KEY || !API_SECRET) {
        console.warn('Alpaca API keys not found');
        return;
      }
      
      // Close existing connection if any
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      
      // Connect to Alpaca WebSocket
      const ws = new WebSocket('wss://stream.data.alpaca.markets/v2/iex');
      wsRef.current = ws;
      
      // Define symbols to track
      const symbols = ['SPY', 'QQQ', 'VIX', 'AAPL'];
      
      ws.onopen = () => {
        console.log('Connected to Alpaca WebSocket');
        setConnectionStatus('connected');
        
        // Authenticate
        ws.send(JSON.stringify({
          action: 'auth',
          key: API_KEY,
          secret: API_SECRET
        }));
        
        // Subscribe to trade updates for our symbols
        ws.send(JSON.stringify({
          action: 'subscribe',
          trades: symbols,
          quotes: symbols
        }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Handle authentication confirmation
        if (data[0] && data[0].T === 'success' && data[0].msg === 'authenticated') {
          console.log('Successfully authenticated with Alpaca WebSocket');
        }
        
        // Handle trade updates
        if (data[0] && data[0].T === 'q') { // Quote update
          const quote = data[0];
          const symbol = quote.S;
          
          // Update marketData state with new price info
          setMarketData(prevData => {
            // Skip if we don't have this symbol in our state
            if (!prevData[symbol]) return prevData;
            
            const newPrice = (quote.ap + quote.bp) / 2; // Midpoint of ask/bid
            const prevPrice = prevData[symbol].price;
            const changePercent = ((newPrice - prevPrice) / prevPrice) * 100;
            
            return {
              ...prevData,
              [symbol]: {
                ...prevData[symbol],
                price: newPrice,
                change: changePercent.toFixed(2)
              }
            };
          });
          
          // Also update positions if the symbol matches
          setPositions(prevPositions => {
            return prevPositions.map(position => {
              if (position.symbol === symbol) {
                const newPrice = (quote.ap + quote.bp) / 2;
                const plValue = (newPrice - position.entryPrice) * position.quantity;
                const plPercent = ((newPrice / position.entryPrice) - 1) * 100;
                
                return {
                  ...position,
                  currentPrice: newPrice,
                  plValue,
                  plPercent: plPercent.toFixed(2)
                };
              }
              return position;
            });
          });
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        
        // Try to reconnect after a short delay
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectWebSocket();
        }, 5000);
      };
      
      ws.onclose = () => {
        console.log('Disconnected from Alpaca WebSocket');
        setConnectionStatus('disconnected');
        
        // Try to reconnect after a short delay
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectWebSocket();
        }, 5000);
      };
      
      return ws;
    };
    
    const ws = connectWebSocket();
    
    // Clean up on unmount
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // Using the unified WebSocket endpoint for crypto data
  useEffect(() => {
    const connectCryptoWebSocket = () => {
      // Using hardcoded API keys
      if (!API_KEY || !API_SECRET) {
        console.warn('Alpaca API keys not found');
        return;
      }
      
      // Close existing connection
      if (cryptoWsRef.current && cryptoWsRef.current.readyState === WebSocket.OPEN) {
        cryptoWsRef.current.close();
      }
      
      // Connect to Alpaca's unified WebSocket endpoint for crypto
      const ws = new WebSocket('wss://stream.data.alpaca.markets/v2/iex');
      cryptoWsRef.current = ws;
      
      ws.onopen = () => {
        console.log('Connected to Alpaca Crypto WebSocket');
        
        // Authenticate
        ws.send(JSON.stringify({
          action: 'auth',
          key: API_KEY,
          secret: API_SECRET
        }));
        
        // Subscribe to BTC updates - using the symbol format Alpaca expects
        ws.send(JSON.stringify({
          action: 'subscribe',
          symbols: ['BTC/USD'],
          quotes: ['BTC/USD']
        }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Handle authentication confirmation
        if (data[0] && data[0].T === 'success' && data[0].msg === 'authenticated') {
          console.log('Successfully authenticated with Crypto WebSocket');
        }
        
        // Handle crypto updates
        if (data[0] && data[0].T === 'q') { // Quote update
          const quote = data[0];
          
          if (quote.S === 'BTC/USD') {
            setMarketData(prevData => {
              const newPrice = (quote.ap + quote.bp) / 2; // Midpoint of ask/bid
              const prevPrice = prevData.BTC.price;
              const changePercent = ((newPrice - prevPrice) / prevPrice) * 100;
              
              return {
                ...prevData,
                BTC: {
                  ...prevData.BTC,
                  price: newPrice,
                  change: changePercent.toFixed(2)
                }
              };
            });
          }
        }
      };
      
      ws.onerror = (error) => {
        console.error('Crypto WebSocket error:', error);
        
        // Try to reconnect after a short delay
        setTimeout(() => {
          console.log('Attempting to reconnect crypto...');
          connectCryptoWebSocket();
        }, 5000);
      };
      
      ws.onclose = () => {
        console.log('Disconnected from Alpaca Crypto WebSocket');
        
        // Try to reconnect after a short delay
        setTimeout(() => {
          console.log('Attempting to reconnect crypto...');
          connectCryptoWebSocket();
        }, 5000);
      };
      
      return ws;
    };
    
    const ws = connectCryptoWebSocket();
    
    // Clean up on unmount
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-circle">T</div>
          <span>TradeSync</span>
        </div>
        
        <nav className="nav-menu">
          <ul>
            <li className="active">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
              </svg>
              <span>Dashboard</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17v-2h2v2h-2zm2.07-7.75l-.9.92c-.5.51-.86.97-1.04 1.69-.08.32-.13.68-.13 1.14h-2v-.5c0-.46.08-.9.22-1.31.2-.58.53-1.1.95-1.52l1.24-1.26c.46-.44.68-1.1.55-1.8-.13-.72-.69-1.33-1.39-1.53-1.11-.31-2.14.32-2.47 1.27-.12.35-.47.59-.85.59h-.55c-.56 0-.96-.53-.81-1.07.57-1.91 2.37-3.21 4.43-3.21 2.43 0 4.44 1.85 4.44 4.15 0 1.22-.63 2.32-1.69 3.09z" />
              </svg>
              <span>AI Insights</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M4 6h16v2H4zm0 6h16v2H4zm0 6h16v2H4z" />
              </svg>
              <span>Portfolio</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M3.5 18.5l6-6 4 4L22 6.92 20.59 5.5l-8.09 8.11-4-4L2 16.5z" />
              </svg>
              <span>Performance</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13z" />
              </svg>
              <span>Settings</span>
            </li>
          </ul>
        </nav>
        
        <div className="user-profile">
          <div className="user-avatar">JP</div>
          <div className="user-info">
            <div className="user-name">John Parker</div>
            <div className="user-role">Bot Builder</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="header-actions">
            <div className="connection-status">
              <span className={`status-indicator ${connectionStatus}`}></span>
              <span>{connectionStatus === 'connected' ? 'Connected' : 
                    connectionStatus === 'error' ? 'Connection Error' : 'Connecting...'}</span>
            </div>
            <div className="trading-mode">
              <button className="paper-mode active">PAPER</button>
              <button className="live-mode">LIVE</button>
            </div>
          </div>
        </header>

        <div className="dashboard-body">
          {/* Market Ticker */}
          <section className="market-ticker">
            <div className="ticker-item">
              <div className="symbol">SPY</div>
              <div className="price">{formatCurrency(marketData.SPY.price)}</div>
              <div className={`change ${parseFloat(marketData.SPY.change) >= 0 ? 'positive' : 'negative'}`}>
                {parseFloat(marketData.SPY.change) >= 0 ? '+' : ''}{marketData.SPY.change}%
              </div>
            </div>
            <div className="ticker-item">
              <div className="symbol">QQQ</div>
              <div className="price">{formatCurrency(marketData.QQQ.price)}</div>
              <div className={`change ${parseFloat(marketData.QQQ.change) >= 0 ? 'positive' : 'negative'}`}>
                {parseFloat(marketData.QQQ.change) >= 0 ? '+' : ''}{marketData.QQQ.change}%
              </div>
            </div>
            <div className="ticker-item">
              <div className="symbol">VIX</div>
              <div className="price">{formatCurrency(marketData.VIX.price)}</div>
              <div className={`change ${parseFloat(marketData.VIX.change) >= 0 ? 'positive' : 'negative'}`}>
                {parseFloat(marketData.VIX.change) >= 0 ? '+' : ''}{marketData.VIX.change}%
              </div>
            </div>
            <div className="ticker-item">
              <div className="symbol">AAPL</div>
              <div className="price">{formatCurrency(marketData.AAPL.price)}</div>
              <div className={`change ${parseFloat(marketData.AAPL.change) >= 0 ? 'positive' : 'negative'}`}>
                {parseFloat(marketData.AAPL.change) >= 0 ? '+' : ''}{marketData.AAPL.change}%
              </div>
            </div>
            <div className="ticker-item">
              <div className="symbol">BTC</div>
              <div className="price">{formatCurrency(marketData.BTC.price)}</div>
              <div className={`change ${parseFloat(marketData.BTC.change) >= 0 ? 'positive' : 'negative'}`}>
                {parseFloat(marketData.BTC.change) >= 0 ? '+' : ''}{marketData.BTC.change}%
              </div>
            </div>
            <div className="ticker-view-all">
              <button className="view-all-btn">View All Markets</button>
            </div>
          </section>

          <div className="content-columns">
            {/* Left Column */}
            <div className="column-left">
              {/* Positions Section */}
              <section className="positions-section">
                <div className="section-header">
                  <h2>Open Positions</h2>
                  <button className="new-trade-btn">+ New Trade</button>
                </div>

                <div className="positions-list">
                  {positions.map(position => (
                    <div key={position.id} className={`position-card ${position.plValue >= 0 ? 'profit' : 'loss'} ${expandedPosition === position.id ? 'expanded' : ''}`}>
                      <div className="position-header" onClick={() => togglePosition(position.id)}>
                        <div className="position-title">
                          {position.type === 'stock' ? `${position.symbol} Stock` : position.symbol}
                        </div>
                        <div className="position-details">
                          <div className="position-row">
                            <div className="detail-group">
                              <div className="detail-label">Quantity</div>
                              <div className="detail-value">{position.quantity}</div>
                            </div>
                            <div className="detail-group">
                              <div className="detail-label">Entry Price</div>
                              <div className="detail-value">{formatCurrency(position.entryPrice)}</div>
                            </div>
                            <div className="detail-group">
                              <div className="detail-label">Current Price</div>
                              <div className="detail-value">{formatCurrency(position.currentPrice)}</div>
                            </div>
                            <div className="detail-group">
                              <div className="detail-label">Cost Basis</div>
                              <div className="detail-value">{formatCurrency(position.costBasis)}</div>
                            </div>
                            <div className="detail-group">
                              <div className="detail-label">P/L ($)</div>
                              <div className={`detail-value ${position.plValue >= 0 ? 'positive' : 'negative'}`}>
                                {formatCurrency(position.plValue)}
                              </div>
                            </div>
                            <div className="detail-group">
                              <div className="detail-label">P/L (%)</div>
                              <div className={`detail-value ${position.plPercent >= 0 ? 'positive' : 'negative'}`}>
                                {formatPercentage(position.plPercent)}
                              </div>
                            </div>
                            <div className="detail-group">
                              <div className="detail-label">Day's P/L</div>
                              <div className={`detail-value ${position.dayChange >= 0 ? 'positive' : 'negative'}`}>
                                {formatPercentage(position.dayChange)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="position-toggle">
                          <span className="toggle-icon">{expandedPosition === position.id ? '▲' : '▼'}</span>
                        </div>
                      </div>
                      
                      {expandedPosition === position.id && (
                        <div className="position-expanded">
                          <div className="scale-buttons">
                            <button className="scale-btn" onClick={() => handleScale(position.id, 15)}>15%</button>
                            <button className="scale-btn" onClick={() => handleScale(position.id, 25)}>25%</button>
                            <button className="scale-btn" onClick={() => handleScale(position.id, 50)}>50%</button>
                            <button className="scale-btn" onClick={() => handleScale(position.id, 75)}>75%</button>
                            <button className="scale-btn" onClick={() => handleScale(position.id, 100)}>100%</button>
                          </div>
                          <div className="position-actions">
                            <button className="buy-more-btn">Buy More</button>
                            <button className="sell-position-btn">Sell Position</button>
                            <button className="view-details-btn">View Details</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* AI Trade Insights Section */}
              <section className="insights-section">
                <h2>AI Trade Insights</h2>
                
                <div className="insights-tabs">
                  <button className="tab-btn active">All Insights</button>
                  <button className="tab-btn">Technical</button>
                  <button className="tab-btn">News</button>
                  <button className="tab-btn">Fundamental</button>
                </div>
                
                <div className="sentiment-filter">
                  <span>Sentiment:</span>
                  <div className="sentiment-tags">
                    <button className="sentiment-tag bullish active">Bullish</button>
                    <button className="sentiment-tag bearish">Bearish</button>
                    <button className="sentiment-tag neutral">Neutral</button>
                  </div>
                </div>
                
                <div className="insight-card">
                  <div className="insight-header">
                    <div className="symbol-container">
                      <span className="insight-symbol">HOOD</span>
                      <span className="insight-type">Actionable Trade</span>
                    </div>
                    <div className="confidence-score">85%</div>
                  </div>
                  <div className="insight-content">
                    <p>Buy above $24.5, stop below today's low. Looking for a move to $28 based on volume pattern and support levels. Watching for a breakout above the daily resistance.</p>
                  </div>
                  <div className="insight-footer">
                    <div className="source-info">
                      <div className="source-avatar">SN</div>
                      <span className="source-name">@ripster47</span>
                      <span className="timestamp">47 min ago</span>
                    </div>
                    <div className="insight-actions">
                      <button className="buy-now-btn">Buy Now</button>
                      <button className="sell-now-btn">Sell Now</button>
                      <button className="details-btn">View Details</button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            
            {/* Right Column */}
            <div className="column-right">
              {/* Account Summary */}
              <section className="account-summary">
                <h2>Account Summary</h2>
                <div className="account-value">{formatCurrency(accountSummary.totalValue)}</div>
                
                <div className="cash-container">
                  <div className="cash-label">Available Cash</div>
                  <div className="cash-value">{formatCurrency(accountSummary.availableCash)}</div>
                </div>
                
                <div className="pl-grid">
                  <div className="pl-item">
                    <div className="pl-label">Open P/L</div>
                    <div className={`pl-value ${accountSummary.openPL >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(accountSummary.openPL)}
                    </div>
                  </div>
                  <div className="pl-item">
                    <div className="pl-label">Closed P/L</div>
                    <div className={`pl-value ${accountSummary.closedPL >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(accountSummary.closedPL)}
                    </div>
                  </div>
                </div>
              </section>
              
              {/* Performance */}
              <section className="performance-section">
                <h2>Performance</h2>
                
                <div className="performance-tabs">
                  <button className="performance-tab active">1D</button>
                  <button className="performance-tab">1W</button>
                  <button className="performance-tab">1M</button>
                  <button className="performance-tab">3M</button>
                  <button className="performance-tab">1Y</button>
                </div>
                
                <div className="chart-container">
                  <div className="chart-placeholder"></div>
                  <div className="performance-value">+2.45%</div>
                </div>
              </section>
              
              {/* Trading Stats */}
              <section className="trading-stats">
                <h2>Trading Stats</h2>
                
                <div className="win-rate">
                  <div className="stat-label">Win Rate</div>
                  <div className="stat-value">78% (21/27)</div>
                </div>
                
                <div className="average-stats">
                  <div className="stat-item">
                    <div className="stat-label">Average Gain</div>
                    <div className="stat-value positive">+14.2%</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Average Loss</div>
                    <div className="stat-value negative">-8.6%</div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeSyncDashboard;
