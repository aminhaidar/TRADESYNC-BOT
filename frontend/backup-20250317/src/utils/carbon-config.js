/**
 * Carbon Design System configuration utilities
 * Provides helpers for consistent Carbon theming across components
 */

// Carbon theme tokens - can be imported in any component
export const carbonTokens = {
  // Colors
  blue: 'var(--cds-interactive)',
  green: 'var(--cds-support-success)',
  red: 'var(--cds-support-error)',
  orange: 'var(--cds-support-warning)',
  purple: 'var(--cds-support-info)',
  
  // Background colors
  bgPrimary: 'var(--cds-background)',
  bgSecondary: 'var(--cds-layer-01)',
  bgTertiary: 'var(--cds-layer-02)',
  
  // Text colors
  textPrimary: 'var(--cds-text-primary)',
  textSecondary: 'var(--cds-text-secondary)',
  
  // Border colors
  borderSubtle: 'var(--cds-border-subtle-00)',
  borderStrong: 'var(--cds-border-strong-01)',
  
  // Radius
  cardRadius: 'var(--card-radius)',
};

// Carbon spacing - matches Carbon spacing tokens
export const spacing = {
  xs: 'var(--cds-spacing-03)',  // 8px
  sm: 'var(--cds-spacing-04)',  // 12px
  md: 'var(--cds-spacing-05)',  // 16px
  lg: 'var(--cds-spacing-06)',  // 24px
  xl: 'var(--cds-spacing-07)',  // 32px
  xxl: 'var(--cds-spacing-08)', // 40px
};

// Function to generate Carbon style class names
export const carbonClass = (base, modifiers = {}) => {
  const classes = [base];
  
  Object.entries(modifiers).forEach(([key, value]) => {
    if (value) {
      classes.push(`${base}--${key}`);
    }
  });
  
  return classes.join(' ');
};

// Default Carbon props for common components
export const defaultProps = {
  button: {
    size: 'sm',
  },
  tile: {
    light: false,
  },
  tag: {
    size: 'sm',
    type: 'blue',
  },
};

// Map trading app status to Carbon notification kinds
export const statusToKind = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
  connected: 'success',
  disconnected: 'warning',
};
