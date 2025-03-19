import { createTheme } from '@mui/material/styles';

// Modern dark theme with deep blues and vibrant accents
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3a8eff', // Bright blue
      light: '#5ca5ff',
      dark: '#0063cb',
    },
    secondary: {
      main: '#10b981', // Modern green
      light: '#4ade80',
      dark: '#059669',
    },
    error: {
      main: '#ef4444', // Vivid red
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b', // Amber
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#3b82f6', // Blue
      light: '#60a5fa',
      dark: '#2563eb',
    },
    success: {
      main: '#10b981', // Green
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#0f172a', // Deep blue-black
      paper: '#1e293b', // Navy blue
      card: '#1e293b',
      lighter: '#334155', // Lighter slate for hover states
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      disabled: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(148, 163, 184, 0.08)',
        },
      },
    },
  },
});

export default theme;
