import React, { useState, useEffect } from 'react';
import { fetchStockData, fetchTrades, fetchMarketData, fetchPortfolio } from './api';
import io from 'socket.io-client';

function App() {
  const [stockData, setStockData] = useState(null);
  const [trades, setTrades] = useState([]);
  const [marketData, setMarketData] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const stock = await fetchStockData('AAPL');
      const trade = await fetchTrades();
      const market = await fetchMarketData();
      const port = await fetchPortfolio();
      setStockData(stock);
      setTrades(trade.error ? [] : trade);
      setMarketData(market);
      setPortfolio(port);
      setLoading(false);
    };
    loadData();

    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    socket.on('connect', () => console.log('Connected to WebSocket'));
    socket.on('indices_update', (data) => setMarketData(data));
    socket.on('portfolio_update', (data) => setPortfolio(data));
    socket.on('trade_alert', (alert) => {
      setTrades((prevTrades) => [alert, ...prevTrades].slice(0, 20));
      console.log('New trade alert received:', alert);
    });

    return () => socket.disconnect();
  }, []);

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">TradeSync Bot Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl">Stock Data (AAPL)</h2>
          <pre>{JSON.stringify(stockData, null, 2)}</pre>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl">Trades</h2>
          <pre>{JSON.stringify(trades, null, 2)}</pre>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl">Market Data</h2>
          <pre>{JSON.stringify(marketData, null, 2)}</pre>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl">Portfolio</h2>
          <pre>{JSON.stringify(portfolio, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}

export default App;