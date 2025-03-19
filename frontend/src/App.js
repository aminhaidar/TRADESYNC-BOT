import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import TradeSyncDashboard from './components/TradeSyncDashboard';

// Create a dark theme for Material UI
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f8cff', // Vibrant blue
    },
    secondary: {
      main: '#00e676', // Bright green
    },
    error: {
      main: '#ff5252', // Bright red
    },
    warning: {
      main: '#ffab40', // Orange
    },
    info: {
      main: '#40c4ff', // Light blue
    },
    success: {
      main: '#69f0ae', // Bright green
    },
    background: {
      default: '#0a1929', // Deep blue-black
      paper: '#132f4c', // Navy blue
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0bec5',
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
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
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
