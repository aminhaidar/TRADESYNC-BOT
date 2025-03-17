import { useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

const API_URL = 'http://localhost:5001';

export default function useTradeData() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { lastMessage } = useSocket();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching dashboard data from:", `${API_URL}/api/dashboard-data`);
      
      const response = await fetch(`${API_URL}/api/dashboard-data`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Dashboard data received:", data);
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Refresh data when a new trade update is received
  useEffect(() => {
    if (lastMessage) {
      console.log("Trade update received, refreshing data");
      fetchData();
    }
  }, [lastMessage]);

  return { dashboardData, isLoading, error, refreshData: fetchData };
}
