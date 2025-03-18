import React from 'react';
import CARBON_FLAGS from '../utils/feature-flags';

// Original dashboard
import TradeSyncDashboard from './TradeSyncDashboard';

// Carbon dashboard
import CarbonDashboard from './carbon/CarbonDashboard';

/**
 * Dashboard wrapper that conditionally renders either the original
 * dashboard or the Carbon Design System dashboard.
 */
const TradeSyncDashboardWrapper = (props) => {
  // If all main Carbon components are enabled, use the full Carbon dashboard
  const useFullCarbonDashboard = 
    CARBON_FLAGS.CARBON_SIDEBAR && 
    CARBON_FLAGS.CARBON_HEADER && 
    CARBON_FLAGS.CARBON_MARKET_OVERVIEW &&
    CARBON_FLAGS.CARBON_POSITIONS &&
    CARBON_FLAGS.CARBON_ACCOUNT_SUMMARY &&
    CARBON_FLAGS.CARBON_AI_INSIGHTS;
  
  // You can also enable from URL with ?carbon=all
  
  if (useFullCarbonDashboard) {
    return <CarbonDashboard {...props} />;
  }
  
  // Otherwise use the original dashboard
  return <TradeSyncDashboard {...props} />;
};

export default TradeSyncDashboardWrapper;
