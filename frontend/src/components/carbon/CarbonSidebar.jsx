import React from 'react';
import {
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem
} from 'carbon-components-react';
import {
  Dashboard24,
  Analytics24,
  Portfolio24,
  SettingsAdjust24,
  UserAvatar24,
  LightbulbFilled24
} from '@carbon/icons-react';

const CarbonSidebar = ({ expanded = true }) => {
  return (
    <SideNav 
      isFixedNav
      expanded={expanded}
      isChildOfHeader={false}
      aria-label="Trading Navigation"
      className="trading-sidebar"
    >
      <div className="trading-logo">
        <span className="logo-circle"></span>
        <span className="logo-text">Trade<span className="logo-highlight">Sync</span></span>
      </div>
      
      <SideNavItems>
        <SideNavLink 
          renderIcon={Dashboard24}
          href="javascript:void(0)"
          isActive
        >
          Dashboard
        </SideNavLink>
        
        <SideNavLink 
          renderIcon={LightbulbFilled24}
          href="javascript:void(0)"
        >
          AI Insights
        </SideNavLink>
        
        <SideNavLink 
          renderIcon={Portfolio24}
          href="javascript:void(0)"
        >
          Portfolio
        </SideNavLink>
        
        <SideNavMenu
          renderIcon={Analytics24}
          title="Performance"
        >
          <SideNavMenuItem href="javascript:void(0)">
            Statistics
          </SideNavMenuItem>
          <SideNavMenuItem href="javascript:void(0)">
            Trade History
          </SideNavMenuItem>
          <SideNavMenuItem href="javascript:void(0)">
            Reports
          </SideNavMenuItem>
        </SideNavMenu>
        
        <SideNavLink 
          renderIcon={SettingsAdjust24}
          href="javascript:void(0)"
        >
          Settings
        </SideNavLink>
      </SideNavItems>
      
      <div className="user-profile">
        <div className="user-avatar">JP</div>
        <div className="user-info">
          <div className="user-name">John Parker</div>
          <div className="user-role">Bot Builder</div>
        </div>
      </div>
    </SideNav>
  );
};

export default CarbonSidebar;
