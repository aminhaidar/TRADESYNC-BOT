/**
 * Feature flags to control Carbon Design System migration
 * This allows for gradual component migration 
 */

const CARBON_FLAGS = {
  // Core Components
  CARBON_SIDEBAR: true,
  CARBON_HEADER: true,
  CARBON_MARKET_OVERVIEW: true,
  CARBON_POSITIONS: true,
  CARBON_ACCOUNT_SUMMARY: true,
  CARBON_AI_INSIGHTS: true,
  
  // Visual elements
  CARBON_THEME: true,       // Use Carbon theme variables
  CARBON_NOTIFICATIONS: true, // Use Carbon notifications
  CARBON_FORMS: false,      // Use Carbon form controls (future)
  CARBON_DATA_TABLES: true, // Use Carbon data tables
  CARBON_CHARTS: false,     // Use Carbon charts (pending package fix)
  
  // Features
  DARK_MODE_TOGGLE: false,  // Add dark/light theme toggle (future)
};

// For development testing - enable from URL params
// e.g. ?carbon=all or ?carbon=sidebar,header
const initFromUrl = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const carbonParam = urlParams.get('carbon');
    
    if (carbonParam === 'all') {
      Object.keys(CARBON_FLAGS).forEach(key => {
        CARBON_FLAGS[key] = true;
      });
    } else if (carbonParam === 'none') {
      Object.keys(CARBON_FLAGS).forEach(key => {
        CARBON_FLAGS[key] = false;
      });
    } else if (carbonParam) {
      // Enable specific flags
      const flags = carbonParam.split(',');
      flags.forEach(flag => {
        const upperFlag = `CARBON_${flag.toUpperCase()}`;
        if (upperFlag in CARBON_FLAGS) {
          CARBON_FLAGS[upperFlag] = true;
        }
      });
    }
  } catch (e) {
    console.error('Error parsing feature flags from URL', e);
  }
};

// Initialize flags from URL if in browser
if (typeof window !== 'undefined') {
  initFromUrl();
}

export const isEnabled = (flag) => {
  return !!CARBON_FLAGS[flag];
};

export default CARBON_FLAGS;
