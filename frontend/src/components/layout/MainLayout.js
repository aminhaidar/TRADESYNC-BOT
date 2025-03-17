import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';
import '../../styles/layout.css';

const MainLayout = ({ children }) => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const handleNavigationChange = (section) => {
    setActiveSection(section);
  };

  return (
    <div className="main-layout">
      <Sidebar 
        activeSection={activeSection}
        onNavigationChange={handleNavigationChange}
      />
      
      <Header />
      
      <main className="main-content">
        {children}
      </main>
      
      <MobileNavigation 
        activeSection={activeSection}
        onNavigationChange={handleNavigationChange}
      />
    </div>
  );
};

export default MainLayout;
