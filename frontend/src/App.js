import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import TradeSyncDashboard from './components/TradeSyncDashboard';

// Create a dark theme for Material UI
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1F6FEB',
    },
    secondary: {
      main: '#3FB950',
    },
    error: {
      main: '#F85149',
    },
    warning: {
      main: '#F5A623',
    },
    background: {
      default: '#0D1117',
      paper: '#161B22',
    },
    text: {
      primary: '#F6F8FA',
      secondary: '#8B949E',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TradeSyncDashboard />
    </ThemeProvider>
  );
}

export default App;
