import React, { useEffect, useState } from 'react';
import {
  Grid,
  Row,
  Column,
  Header,
  HeaderName,
  HeaderGlobalAction,
  HeaderGlobalBar,
  Toggle,
  InlineNotification,
  HeaderPanel,
  Button
} from 'carbon-components-react';

import {
  Notification20,
  UserAvatar20
} from '@carbon/icons-react';

import { useSocket } from '../../context/SocketContext';

// Import Carbon components
import CarbonSidebar from './CarbonSidebar';
import CarbonMarketOverview from './CarbonMarketOverview';
import CarbonPositions from './CarbonPositions';
import CarbonAccountSummary from './CarbonAccountSummary';
import CarbonAIInsights from './CarbonAIInsights';

import './CarbonDashboard.scss';

const CarbonDashboard = () => {
  const { socket } = useSocket();
  const [marketData, setMarketData] = useState({});
  const [positions, setPositions] = useState([]);
  const [tradePerformance, setTradePerformance] = useState({ labels: [], values: [] });
  const [accountSummary, setAccountSummary] = useState({ 
    totalValue: 52481.24, 
    availableCash: 37888.52, 
    openPL: 508.97, 
    closedPL: 774.60 
  });
  const [insights, setInsights] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [isLiveTrading, setIsLiveTrading] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [sideNavExpanded, setSideNavExpanded] = useState(true);

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        setConnectionStatus('connected');
        showNotification('Connected to server', 'success', 'Real-time data updates enabled');
      });
      
      socket.on('disconnect', () => {
        setConnectionStatus('disconnected');
        showNotification('Disconnected from server', 'warning', 'Attempting to reconnect...');
      });
      
      socket.on('connect_error', () => {
        setConnectionStatus('error');
        showNotification('Connection error', 'error', 'Unable to connect to trading server');
      });
      
      socket.on('marketData', (data) => {
        setMarketData((prev) => ({ ...prev, [data.symbol]: data }));
      });
      
      socket.on('positions', (data) => {
        if (Array.isArray(data)) {
          setPositions(data);
        }
      });
      
      socket.on('tradePerformance', (data) => {
        setTradePerformance({
          labels: data.labels || ['1D', '2D', '3D', '4D', '5D'],
          values: data.values || [1000, 1050, 1100, 1080, 1150],
        });
      });
      
      socket.on('accountSummary', (data) => {
        setAccountSummary((prev) => ({ ...prev, ...data }));
      });
      
      socket.on('aiInsights', (data) => {
        if (Array.isArray(data)) {
          setInsights(data);
        }
      });
      
      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('marketData');
        socket.off('positions');
        socket.off('tradePerformance');
        socket.off('accountSummary');
        socket.off('aiInsights');
      };
    }
  }, [socket]);

  const showNotification = (title, kind, subtitle) => {
    const id = Date.now();
    const notification = { id, title, kind, subtitle };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleInsightSelect = (insight) => {
    setSelectedInsight(insight);
  };
  
  const handleExecuteTrade = (trade) => {
    console.log('Executing trade:', trade);
    
    showNotification(
      `${trade.action.toUpperCase()} order executed`, 
      'info', 
      `${trade.action.toUpperCase()} ${trade.symbol} at market price`
    );
  };

  const toggleTradingMode = () => {
    const newMode = !isLiveTrading;
    setIsLiveTrading(newMode);
    
    showNotification(
      `Switched to ${newMode ? 'LIVE' : 'PAPER'} trading mode`,
      newMode ? 'warning' : 'info',
      newMode ? 'Real funds will be used for trades' : 'Paper trading enabled'
    );
  };

  const toggleSideNav = () => {
    setSideNavExpanded(!sideNavExpanded);
  };

  return (
    <div className="carbon-dashboard">
      <CarbonSidebar expanded={sideNavExpanded} />
      
      <div className="dashboard-content">
        <Header aria-label="TradeSync Platform" className="dashboard-header">
          <HeaderName prefix="Trade" onClick={toggleSideNav}>
            Sync
          </HeaderName>
          
          <HeaderGlobalBar>
            <div className="trading-mode-container">
              <span className={`trading-mode-label ${isLiveTrading ? 'live' : 'paper'}`}>
                {isLiveTrading ? 'LIVE' : 'PAPER'}
              </span>
              <Toggle
                id="trading-mode-toggle"
                size="sm"
                toggled={isLiveTrading}
                onChange={toggleTradingMode}
                labelA=""
                labelB=""
              />
            </div>
            
            <HeaderGlobalAction 
              aria-label="Notifications" 
              onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
              isActive={notificationPanelOpen}
            >
              <Notification20 />
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </HeaderGlobalAction>
            
            <HeaderGlobalAction aria-label="User Profile">
              <UserAvatar20 />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
          
          <HeaderPanel aria-label="Notifications" expanded={notificationPanelOpen}>
            <div className="notification-panel">
              <h3>Notifications</h3>
              {notifications.length > 0 ? (
                <div className="notification-list">
                  {notifications.map(notification => (
                    <InlineNotification
                      key={notification.id}
                      kind={notification.kind}
                      title={notification.title}
                      subtitle={notification.subtitle}
                      hideCloseButton={false}
                      onCloseButtonClick={() => {
                        setNotifications(prev => 
                          prev.filter(n => n.id !== notification.id)
                        );
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="no-notifications">No new notifications</p>
              )}
              
              <Button kind="ghost" size="sm" className="clear-all-btn">
                Clear All
              </Button>
            </div>
          </HeaderPanel>
        </Header>
        
        <div className="dashboard-main">
          <Grid>
            <Row>
              <Column>
                <CarbonMarketOverview marketData={marketData} />
              </Column>
            </Row>
            
            <Row>
              <Column sm={4} md={4} lg={4}>
                <CarbonAccountSummary 
                  accountSummary={accountSummary} 
                  performanceData={tradePerformance} 
                />
              </Column>
              
              <Column sm={4} md={4} lg={12}>
                <CarbonPositions positions={positions} />
                
                <CarbonAIInsights
                  insights={insights}
                  onInsightSelect={handleInsightSelect}
                  onExecuteTrade={handleExecuteTrade}
                  selectedInsight={selectedInsight}
                />
              </Column>
            </Row>
          </Grid>
        </div>
      </div>
    </div>
  );
};

export default CarbonDashboard;
