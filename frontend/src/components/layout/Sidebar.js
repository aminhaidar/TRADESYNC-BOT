import React from 'react';

const Sidebar = ({ activeSection, onNavigationChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'positions', label: 'Positions', icon: '📈' },
    { id: 'insights', label: 'AI Insights', icon: '🤖' },
    { id: 'history', label: 'Trade History', icon: '📜' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];
  
  return (
    <aside className="sidebar">
      <div className="logo">
        <h2>TradeSync</h2>
      </div>
      
      <nav className="nav-menu">
        {navItems.map(item => (
          <div 
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onNavigationChange(item.id)}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="connection-status">
          <span className="status-indicator online"></span>
          <span>Connected</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
