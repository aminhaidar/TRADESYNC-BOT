import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container,
  Typography, 
  Paper, 
  Grid, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Snackbar
} from '@mui/material';

const TradeSyncDashboard = () => {
  // State for insights and dashboard
  const [insights, setInsights] = useState([]);
  const [closedInsights, setClosedInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for trading UI
  const [openTradeDialog, setOpenTradeDialog] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });
  const [activeTab, setActiveTab] = useState(0);
  
  // State for market data
  const [marketData, setMarketData] = useState({
    SPY: { symbol: 'SPY', price: 483.58, change: 1.8 },
    QQQ: { symbol: 'QQQ', price: 418.27, change: 1.7 },
    AAPL: { symbol: 'AAPL', price: 213.18, change: 0.8 },
    BTC: { symbol: 'BTC', price: 68474, change: 2.5 }
  });
  
  // State for performance data
  const [performanceData, setPerformanceData] = useState([
    { date: '03/12/2025', equity: 51000, profit: -500 },
    { date: '03/13/2025', equity: 51200, profit: -300 },
    { date: '03/14/2025', equity: 51500, profit: 0 },
    { date: '03/15/2025', equity: 51800, profit: 300 },
    { date: '03/16/2025', equity: 52100, profit: 600 },
    { date: '03/17/2025', equity: 52300, profit: 800 },
    { date: '03/18/2025', equity: 52490, profit: 990 }
  ]);

  // Fetch insights from the API
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

  // Fetch closed insights from the API
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

  // Handle closing a trade
  const handleCloseTrade = async (insightId) => {
    try {
      const response = await fetch(`https://tradesync-bot-service.onrender.com/api/insights/close/${insightId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Trade closed successfully!',
        type: 'success'
      });
      
      // Refresh the insights lists
      fetchInsights();
      fetchClosedInsights();
    } catch (error) {
      console.error(`Error closing insight ${insightId}:`, error);
      setNotification({
        open: true,
        message: `Failed to close trade: ${error.message}`,
        type: 'error'
      });
    }
  };

  // Connect to Alpaca WebSocket for real-time data - simplified simulation
  useEffect(() => {
    // Simulate WebSocket data with setInterval
    const intervalId = setInterval(() => {
      setMarketData(prevData => {
        const newData = {...prevData};
        // Randomly update prices
        Object.keys(newData).forEach(symbol => {
          const currentPrice = newData[symbol].price;
          const randomChange = (Math.random() * 2 - 1) * 0.1; // Random between -0.1% and +0.1%
          const newPrice = parseFloat((currentPrice * (1 + randomChange/100)).toFixed(2));
          const changePercent = parseFloat(((newPrice/currentPrice - 1) * 100).toFixed(2));
          newData[symbol] = {
            ...newData[symbol],
            price: newPrice,
            change: changePercent
          };
        });
        return newData;
      });
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  // Fetch insights data on component mount and set up polling
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

  // Function to handle placing an options trade
  const handlePlaceOptionsTrade = (data) => {
    console.log('Placing options trade:', data);
    
    // Close the dialog
    setOpenTradeDialog(false);
    
    // Show notification
    setNotification({
      open: true,
      message: `Order placed for ${data.quantity} ${data.symbol} ${data.strikePrice} ${data.optionType.toUpperCase()}`,
      type: 'success'
    });
  };

  // Trading dialog component
  const TradeDialog = () => {
    const [symbol, setSymbol] = useState('');
    const [strikePrice, setStrikePrice] = useState('');
    const [optionType, setOptionType] = useState('call');
    const [quantity, setQuantity] = useState(1);
    const [action, setAction] = useState('buy');
    const [expiryDate, setExpiryDate] = useState('03/29/2025');
    
    const handleSubmit = () => {
      handlePlaceOptionsTrade({
        symbol,
        strikePrice,
        optionType,
        quantity,
        action,
        expiryDate
      });
    };
    
    return (
      <Dialog open={openTradeDialog} onClose={() => setOpenTradeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Place Options Trade</DialogTitle>
        <DialogContent>
          <TextField
            label="Symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            fullWidth
            margin="normal"
            placeholder="e.g. SPY"
          />
          <TextField
            label="Strike Price"
            value={strikePrice}
            onChange={(e) => setStrikePrice(e.target.value)}
            fullWidth
            margin="normal"
            type="number"
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            placeholder="e.g. 490"
          />
          <TextField
            label="Expiry Date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="MM/DD/YYYY"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Option Type</InputLabel>
            <Select
              value={optionType}
              onChange={(e) => setOptionType(e.target.value)}
            >
              <MenuItem value="call">Call</MenuItem>
              <MenuItem value="put">Put</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            fullWidth
            margin="normal"
            type="number"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Action</InputLabel>
            <Select
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              <MenuItem value="buy">Buy</MenuItem>
              <MenuItem value="sell">Sell</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTradeDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Place Order</Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Function to determine the background color based on category
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Actionable Trade':
        return '#e8f5e9';
      case 'AI Insight':
        return '#e3f2fd';
      case 'General Insight':
        return '#f5f5f5';
      default:
        return '#ffffff';
    }
  };

  // Function to determine the sentiment color
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'Bullish':
        return '#2e7d32';
      case 'Bearish':
        return '#c62828';
      default:
        return '#757575';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Trade Dialog */}
      <TradeDialog />
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({...notification, open: false})}
        message={notification.message}
      />
      
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        TradeSync Dashboard
      </Typography>

      {/* Market Ticker */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(marketData).map(([key, data]) => (
          <Grid item xs={6} sm={3} key={key}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2">{data.symbol}</Typography>
              <Typography variant="h6">${typeof data.price === 'number' && data.price > 1000 ? data.price.toLocaleString() : data.price}</Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: parseFloat(data.change) >= 0 ? 'success.main' : 'error.main',
                  fontWeight: 'medium' 
                }}
              >
                {parseFloat(data.change) >= 0 ? '+' : ''}{data.change}%
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      {/* Main Dashboard Grid */}
      <Grid container spacing={3}>
        {/* Left Column - 2/3 width */}
        <Grid item xs={12} md={8}>
          {/* Performance Chart */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Portfolio Performance</Typography>
              <Tabs 
                value={activeTab} 
                onChange={(e, v) => setActiveTab(v)}
                sx={{ '& .MuiTab-root': { minWidth: 50 } }}
              >
                <Tab label="1D" />
                <Tab label="1W" />
                <Tab label="1M" />
                <Tab label="3M" />
                <Tab label="1Y" />
              </Tabs>
            </Box>
            {/* Chart placeholder - we'll add recharts after fixing the dependency */}
            <Box sx={{ height: 200, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ p: 2 }}>
                Performance chart will appear here after recharts installation
              </Typography>
            </Box>
          </Paper>

          {/* AI Insights Section */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">AI Insights</Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setOpenTradeDialog(true)}
              >
                New Options Trade
              </Button>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
            ) : insights.length === 0 ? (
              <Alert severity="info" sx={{ my: 2 }}>No insights available.</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ticker</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Summary</TableCell>
                      <TableCell>Sentiment</TableCell>
                      <TableCell>Confidence</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {insights.map((insight) => (
                      <TableRow key={insight.id} sx={{ backgroundColor: getCategoryColor(insight.category) }}>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                          {insight.ticker}
                        </TableCell>
                        <TableCell>{insight.category}</TableCell>
                        <TableCell>{insight.summary}</TableCell>
                        <TableCell sx={{ color: getSentimentColor(insight.sentiment), fontWeight: 'medium' }}>
                          {insight.sentiment || 'Neutral'}
                        </TableCell>
                        <TableCell>
                          {insight.confidence ? `${insight.confidence.toFixed(1)}%` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {insight.category === 'Actionable Trade' ? (
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => handleCloseTrade(insight.id)}
                            >
                              Close Trade
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* Closed Trades Section */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Closed Trades</Typography>
            
            {closedInsights.length === 0 ? (
              <Alert severity="info" sx={{ my: 2 }}>No closed trades available.</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ticker</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Summary</TableCell>
                      <TableCell>Sentiment</TableCell>
                      <TableCell>Confidence</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {closedInsights.map((insight) => (
                      <TableRow key={insight.id} sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                          {insight.ticker}
                        </TableCell>
                        <TableCell>{insight.category}</TableCell>
                        <TableCell>{insight.summary}</TableCell>
                        <TableCell sx={{ color: getSentimentColor(insight.sentiment), fontWeight: 'medium' }}>
                          {insight.sentiment || 'Neutral'}
                        </TableCell>
                        <TableCell>
                          {insight.confidence ? `${insight.confidence.toFixed(1)}%` : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
        
        {/* Right Column - 1/3 width */}
        <Grid item xs={12} md={4}>
          {/* Account Summary */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Account Summary</Typography>
            <Typography variant="h4" sx={{ mb: 2 }}>$52,490.40</Typography>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Available Cash</Typography>
              <Typography variant="h6">$37,886.99</Typography>
            </Paper>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary">Open P/L</Typography>
                  <Typography variant="body1" sx={{ color: 'success.main' }}>+$509.59</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary">Closed P/L</Typography>
                  <Typography variant="body1" sx={{ color: 'success.main' }}>+$774.51</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Trading Stats */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Trading Stats</Typography>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Win Rate</Typography>
              <Typography variant="body1">78% (21/27)</Typography>
            </Paper>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary">Average Gain</Typography>
                  <Typography variant="body1" sx={{ color: 'success.main' }}>+14.2%</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary">Average Loss</Typography>
                  <Typography variant="body1" sx={{ color: 'error.main' }}>-8.6%</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TradeSyncDashboard;
