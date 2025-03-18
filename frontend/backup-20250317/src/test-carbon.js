import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/carbon-theme.scss';
import CarbonTest from './components/test/CarbonTest';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CarbonTest />
  </React.StrictMode>
);
