import React from 'react';
import ReactDOM from 'react-dom/client';
import '@carbon/react/css/styles.css';
import './index.css';
import App from './App';

console.log('Index: Starting application');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Removing StrictMode temporarily to avoid double-mounting during development
  // which can cause duplicate socket connections
  <App />
);
