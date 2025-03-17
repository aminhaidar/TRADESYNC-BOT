import React from 'react';

const MobileNavigation = ({ activeSection, onNavigationChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'positions', label: 'Positions', icon: '📈' },
    { id: 'insights', label: 'AI Insights', icon: '🤖' },
    { id: 'history', label: 'Trade History', icon: '📜' }
  ];
  
  return (
    <nav className="mobile-navigation">
      {navItems.map(item => (
        <div 
          key={item.id}
          className={`mobile-nav-item ${activeSection === item.id ? 'active' : ''}`}
          onClick={() => onNavigationChange(item.id)}
        >
          <div className="mobile-nav-icon">{item.icon}</div>
          <div className="mobile-nav-label">{item.label}</div>
        </div>
      ))}
    </nav>
  );
};

export default MobileNavigation;
