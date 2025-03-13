import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Lazy-loaded components
const PortfolioOverview = lazy(() => import('./components/PortfolioOverview'));
const MarketIndices = lazy(() => import('./components/MarketIndices'));
const TradeAlerts = lazy(() => import('./components/TradeAlerts'));
const Sidebar = lazy(() => import('./components/Sidebar'));

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-tradesync-background">
        <Suspense fallback={<div>Loading...</div>}>
          <Sidebar />
          
          <main className="flex-grow p-8 ml-64">
            <Routes>
              <Route 
                path="/" 
                element={
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <PortfolioOverview />
                    <MarketIndices />
                  </div>
                } 
              />
              <Route path="/trades" element={<TradeAlerts />} />
            </Routes>
          </main>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;