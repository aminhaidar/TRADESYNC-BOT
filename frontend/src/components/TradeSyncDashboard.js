import React, { useState, useEffect } from 'react';
import '../App.css';

const TradeSyncDashboard = () => {
  const [insights, setInsights] = useState([]);
  const [closedInsights, setClosedInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://tradesync-bot-service.onrender.com/api/insights');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setInsights(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setError('Failed to load insights. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClosedInsights = async () => {
    try {
      const response = await fetch('https://tradesync-bot-service.onrender.com/api/insights/closed');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setClosedInsights(data);
    } catch (error) {
      console.error('Error fetching closed insights:', error);
    }
  };

  const handleCloseTrade = async (insightId) => {
    try {
      const response = await fetch(`https://tradesync-bot-service.onrender.com/api/insights/close/${insightId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Refresh the insights lists
      fetchInsights();
      fetchClosedInsights();
    } catch (error) {
      console.error(`Error closing insight ${insightId}:`, error);
      alert(`Failed to close trade. Error: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchInsights();
    fetchClosedInsights();
    
    // Set up polling to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchInsights();
      fetchClosedInsights();
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Function to determine the background color based on category
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Actionable Trade':
        return 'bg-green-100';
      case 'AI Insight':
        return 'bg-blue-100';
      case 'General Insight':
        return 'bg-gray-100';
      default:
        return 'bg-white';
    }
  };

  // Function to determine the sentiment color
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'Bullish':
        return 'text-green-600';
      case 'Bearish':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">TradeSync Dashboard</h1>
        
        {/* AI Insights Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Insights</h2>
          
          {loading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading insights...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-red-500">{error}</p>
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No insights available.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticker</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {insights.map((insight) => (
                    <tr key={insight.id} className={getCategoryColor(insight.category)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{insight.ticker}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insight.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{insight.summary}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getSentimentColor(insight.sentiment)}`}>
                        {insight.sentiment || 'Neutral'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {insight.confidence ? `${insight.confidence.toFixed(1)}%` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insight.source}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insight.timestamp}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {insight.category === 'Actionable Trade' ? (
                          <button
                            onClick={() => handleCloseTrade(insight.id)}
                            className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 text-center"
                          >
                            Close Trade
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Closed Trades Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Closed Trades</h2>
          
          {closedInsights.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No closed trades available.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticker</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {closedInsights.map((insight) => (
                    <tr key={insight.id} className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{insight.ticker}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insight.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{insight.summary}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getSentimentColor(insight.sentiment)}`}>
                        {insight.sentiment || 'Neutral'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {insight.confidence ? `${insight.confidence.toFixed(1)}%` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insight.source}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insight.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeSyncDashboard;
