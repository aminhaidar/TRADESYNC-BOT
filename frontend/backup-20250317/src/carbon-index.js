import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/carbon-theme.scss';
import { SocketProvider } from './context/SocketContext';
import TestCarbonApp from './components/carbon/TestCarbonApp';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SocketProvider>
      <TestCarbonApp />
    </SocketProvider>
  </React.StrictMode>
);
