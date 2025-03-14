import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchStockData = async (symbol) => {
  try {
    const response = await axios.get(`${API_URL}/stock_data?symbol=${symbol}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return { error: 'Failed to fetch stock data' };
  }
};

export const fetchTrades = async () => {
  try {
    const response = await axios.get(`${API_URL}/trades`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trades:', error);
    return { error: 'Failed to fetch trades' };
  }
};

export const fetchMarketData = async () => {
  try {
    const response = await axios.get(`${API_URL}/market_data`);
    return response.data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    return { error: 'Failed to fetch market data' };
  }
};

export const fetchPortfolio = async () => {
  try {
    const response = await axios.get(`${API_URL}/portfolio`);
    return response.data;
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return { error: 'Failed to fetch portfolio' };
  }
};