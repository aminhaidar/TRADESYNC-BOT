import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/carbon-theme.scss';
import App from './App';
import { SocketProvider } from './context/SocketContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SocketProvider>
      <App />
    </SocketProvider>
  </React.StrictMode>
);
