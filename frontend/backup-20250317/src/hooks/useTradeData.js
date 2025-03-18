import { useState, useEffect } from 'react';

const useTradeData = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Explicitly use port 5001 here
        const apiUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
        console.log('useTradeData.js: Fetching data from', `${apiUrl}/api/dashboard-data`);
        
        const response = await fetch(`${apiUrl}/api/dashboard-data`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('useTradeData.js: Response status:', response.status);
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('useTradeData.js: Fetched dashboard data:', data);
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('useTradeData.js: Error fetching dashboard data:', err);
        setError(err.message);
        setDashboardData(null);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  const refreshData = () => {
    console.log('useTradeData.js: Triggering data refresh');
    setRefreshTrigger(prev => prev + 1);
  };

  return { dashboardData, error, refreshData };
};

export default useTradeData;
