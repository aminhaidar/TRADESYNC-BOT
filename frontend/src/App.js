import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import TradeSyncDashboard from './components/TradeSyncDashboard';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TradeSyncDashboard />
    </ThemeProvider>
  );
}

export default App;
