import React from 'react';
import {
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
  SideNav,
  SideNavItems,
  SideNavLink,
  Content,
  Theme
} from '@carbon/react';
import {
  Notification,
  User,
  Dashboard,
  ChartLine,
  Portfolio,
  Settings
} from '@carbon/icons-react';

const AppLayout = ({ children, connectionStatus = 'connected' }) => {
  return (
    <Theme theme="g100">
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header aria-label="TradeSync Platform">
          <SkipToContent />
          <HeaderName prefix="">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                backgroundColor: '#0f62fe', 
                color: 'white', 
                borderRadius: '50%', 
                width: '24px', 
                height: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '4px'
              }}>
                T
              </span>
              TradeSync
            </div>
          </HeaderName>
          <HeaderGlobalBar>
            <HeaderGlobalAction aria-label="Notifications" tooltipAlignment="center">
              <Notification size={20} />
            </HeaderGlobalAction>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginRight: '1rem',
              gap: '0.5rem'
            }}>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: connectionStatus === 'connected' ? '#3FB950' : 
                                  connectionStatus === 'error' ? '#F85149' : '#F5A623'
                }}></div>
                <span style={{ fontSize: '0.75rem' }}>
                  {connectionStatus === 'connected' ? 'Connected' : 
                   connectionStatus === 'error' ? 'Connection Error' : 'Connecting...'}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                borderRadius: '1rem', 
                overflow: 'hidden',
                border: '1px solid #333',
                height: '2rem'
              }}>
                <button style={{
                  background: '#F5A623',
                  color: '#161616',
                  border: 'none',
                  padding: '0 0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}>PAPER</button>
                <button style={{
                  background: 'transparent',
                  color: '#8B949E',
                  border: 'none',
                  padding: '0 0.75rem',
                  cursor: 'pointer'
                }}>LIVE</button>
              </div>
            </div>
          </HeaderGlobalBar>
        </Header>
        <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
          <SideNav 
            aria-label="Side navigation" 
            expanded={true}
            isFixedNav
            isChildOfHeader={false}
            style={{ 
              background: '#161616', 
              borderRight: '1px solid #333',
              width: '12rem'
            }}
          >
            <SideNavItems>
              <SideNavLink renderIcon={Dashboard} href="/">
                Dashboard
              </SideNavLink>
              <SideNavLink renderIcon={ChartLine} href="/ai-insights">
                AI Insights
              </SideNavLink>
              <SideNavLink renderIcon={Portfolio} href="/portfolio">
                Portfolio
              </SideNavLink>
              <SideNavLink renderIcon={ChartLine} href="/performance">
                Performance
              </SideNavLink>
              <SideNavLink renderIcon={Settings} href="/settings">
                Settings
              </SideNavLink>
            </SideNavItems>
          </SideNav>
          <Content id="main-content" style={{ background: '#161616', width: '100%', padding: '1rem' }}>
            {children}
          </Content>
        </div>
      </div>
    </Theme>
  );
};

export default AppLayout;
