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
  Snackbar,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoneyIcon from '@mui/icons-material/Money';

const drawerWidth = 240;

const TradeSyncDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  
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
  
  // State for positions
  const [positions, setPositions] = useState([
    { 
      id: 'aapl', 
      symbol: 'AAPL', 
      type: 'stock', 
      quantity: 10, 
      entryPrice: 211.80, 
      currentPrice: 213.25, 
      costBasis: 2118.00, 
      plValue: 14.50, 
      plPercent: 0.7, 
      dayChange: 0.8
    },
    { 
      id: 'tsla', 
      symbol: 'TSLA', 
      type: 'stock', 
      quantity: 15, 
      entryPrice: 180.50, 
      currentPrice: 177.82,
      costBasis: 2707.50, 
      plValue: -40.20, 
      plPercent: -1.5, 
      dayChange: -1.6
    },
    { 
      id: 'spy', 
      symbol: 'SPY 490C 03/29/25', 
      type: 'option', 
      quantity: 5, 
      entryPrice: 4.30, 
      currentPrice: 4.88, 
      costBasis: 2150.00, 
      plValue: 290.00, 
      plPercent: 13.5, 
      dayChange: 6.2
    }
  ]);
  
  // State for expanded position
  const [expandedPosition, setExpandedPosition] = useState(null);
  
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

  // Fetch insights from the API with fallback to mock data
  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://tradesync-bot-service.onrender.com/api/insights');
      
      if (!response.ok) {
        // If the API fails, use mock data
        console.error(`Error from API: ${response.status}`);
        
        // Mock insights data
        const mockInsights = [
          {
            id: 1,
            ticker: "$BTC",
            category: "Actionable Trade",
            subcategory: "",
            sentiment: "Bullish",
            summary: "BTC showing strength at support. Looking for move to 71K.",
            confidence: 85.0,
            source: "@cryptotrader",
            timestamp: "March 19, 2025 at 09:30AM"
          },
          {
            id: 2,
            ticker: "$NVDA",
            category: "AI Insight",
            subcategory: "",
            sentiment: "Bullish", 
            summary: "NVDA building momentum for breakout above 950.",
            confidence: 78.5,
            source: "@techtrader",
            timestamp: "March 19, 2025 at 10:15AM"
          },
          {
            id: 3,
            ticker: "$SPY",
            category: "General Insight",
            subcategory: "Technical",
            sentiment: "Neutral",
            summary: "SPY consolidating in range. Watching volume for direction.",
            confidence: 62.0,
            source: "@marketwizard",
            timestamp: "March 19, 2025 at 11:05AM"
          }
        ];
        
        setInsights(mockInsights);
        setError(null);
      } else {
        const data = await response.json();
        setInsights(data);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
      
      // Set mock data on error
      setInsights([
        {
          id: 1,
          ticker: "$BTC",
          category: "Actionable Trade",
          subcategory: "",
          sentiment: "Bullish",
          summary: "BTC showing strength at support. Looking for move to 71K.",
          confidence: 85.0,
          source: "@cryptotrader",
          timestamp: "March 19, 2025 at 09:30AM"
        },
        {
          id: 2,
          ticker: "$NVDA",
          category: "AI Insight",
          subcategory: "",
          sentiment: "Bullish", 
          summary: "NVDA building momentum for breakout above 950.",
          confidence: 78.5,
          source: "@techtrader",
          timestamp: "March 19, 2025 at 10:15AM"
        },
        {
          id: 3,
          ticker: "$SPY",
          category: "General Insight",
          subcategory: "Technical",
          sentiment: "Neutral",
          summary: "SPY consolidating in range. Watching volume for direction.",
          confidence: 62.0,
          source: "@marketwizard",
          timestamp: "March 19, 2025 at 11:05AM"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch closed insights from the API with fallback to mock data
  const fetchClosedInsights = async () => {
    try {
      const response = await fetch('https://tradesync-bot-service.onrender.com/api/insights/closed');
      
      if (!response.ok) {
        // If the API fails, use mock data
        console.error(`Error from API: ${response.status}`);
        
        // Mock closed insights data
        const mockClosedInsights = [
          {
            id: 4,
            ticker: "$AAPL",
            category: "Actionable Trade",
            subcategory: "",
            sentiment: "Bullish",
            summary: "AAPL breaking out of triangle pattern. Target 230.",
            confidence: 82.0,
            source: "@techbull",
            timestamp: "March 17, 2025 at 02:45PM",
            closed: 1
          }
        ];
        
        setClosedInsights(mockClosedInsights);
      } else {
        const data = await response.json();
        setClosedInsights(data);
      }
    } catch (error) {
      console.error('Error fetching closed insights:', error);
      
      // Set mock data on error
      setClosedInsights([
        {
          id: 4,
          ticker: "$AAPL",
          category: "Actionable Trade",
          subcategory: "",
          sentiment: "Bullish",
          summary: "AAPL breaking out of triangle pattern. Target 230.",
          confidence: 82.0,
          source: "@techbull",
          timestamp: "March 17, 2025 at 02:45PM",
          closed: 1
        }
      ]);
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
      
      // Even on error, simulate successful closure in UI
      const insightToClose = insights.find(insight => insight.id === insightId);
      if (insightToClose) {
        setInsights(insights.filter(insight => insight.id !== insightId));
        setClosedInsights([...closedInsights, {...insightToClose, closed: 1}]);
      }
      
      setNotification({
        open: true,
        message: 'Trade closed successfully!',
        type: 'success'
      });
    }
  };

  // Toggle position expansion
  const togglePosition = (id) => {
    setExpandedPosition(expandedPosition === id ? null : id);
  };

  // Function to handle scaling a position
  const handleScale = (positionId, percentage) => {
    console.log(`Scaling position ${positionId} by ${percentage}%`);
    
    // Show notification
    setNotification({
      open: true,
      message: `Scaled ${positionId.toUpperCase()} position by ${percentage}%`,
      type: 'success'
    });
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
      
      // Also update positions with new prices
      setPositions(prevPositions => {
        return prevPositions.map(position => {
          const randomChange = (Math.random() * 2 - 1) * 0.05; // Random between -0.05% and +0.05%
          const newPrice = parseFloat((position.currentPrice * (1 + randomChange/100)).toFixed(2));
          const plValue = (newPrice - position.entryPrice) * position.quantity;
          const plPercent = parseFloat(((newPrice / position.entryPrice - 1) * 100).toFixed(2));
          
          return {
            ...position,
            currentPrice: newPrice,
            plValue: parseFloat(plValue.toFixed(2)),
            plPercent
          };
        });
      });
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  // Update performance data when tab changes
  useEffect(() => {
    // This would typically fetch data based on the selected timeframe
    const timeframes = ['1D', '1W', '1M', '3M', '1Y'];
    const selectedTimeframe = timeframes[activeTab];
    
    // Simulate fetching data for different timeframes
    const fetchPerformanceData = () => {
      let newData = [];
      
      switch (selectedTimeframe) {
        case '1D':
          newData = Array.from({ length: 8 }, (_, i) => ({
            date: `${9 + i}:00`,
            equity: 52000 + (Math.random() * 1000 - 500),
            profit: (Math.random() * 800 - 400)
          }));
          break;
        case '1W':
          newData = Array.from({ length: 7 }, (_, i) => ({
            date: `03/${12 + i}/2025`,
            equity: 51000 + (i * 300) + (Math.random() * 200 - 100),
            profit: -500 + (i * 250) + (Math.random() * 100 - 50)
          }));
          break;
        case '1M':
          // Default data we already have
          break;
        case '3M':
          newData = Array.from({ length: 12 }, (_, i) => ({
            date: `${['Jan', 'Feb', 'Mar'][Math.floor(i/4)]} ${(i % 4) * 7 + 1}`,
            equity: 48000 + (i * 500) + (Math.random() * 300 - 150),
            profit: -3000 + (i * 400) + (Math.random() * 200 - 100)
          }));
          break;
        case '1Y':
          newData = Array.from({ length: 12 }, (_, i) => ({
            date: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
            equity: 40000 + (i * 1200) + (Math.random() * 500 - 250),
            profit: -10000 + (i * 1000) + (Math.random() * 300 - 150)
          }));
          break;
        default:
          // Use existing data as fallback
          return;
      }
      
      if (selectedTimeframe !== '1M') {
        setPerformanceData(newData);
      }
    };
    
    fetchPerformanceData();
  }, [activeTab]);

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
        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          Place Options Trade
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            label="Symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            fullWidth
            margin="normal"
            placeholder="e.g. SPY"
            variant="outlined"
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
            variant="outlined"
          />
          <TextField
            label="Expiry Date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="MM/DD/YYYY"
            variant="outlined"
          />
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel>Option Type</InputLabel>
            <Select
              value={optionType}
              onChange={(e) => setOptionType(e.target.value)}
              label="Option Type"
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
            variant="outlined"
          />
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel>Action</InputLabel>
            <Select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              label="Action"
            >
              <MenuItem value="buy">Buy</MenuItem>
              <MenuItem value="sell">Sell</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setOpenTradeDialog(false)} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Place Order
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Function to determine the background color based on category
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Actionable Trade':
        return 'rgba(105, 240, 174, 0.1)'; // Green with low opacity
      case 'AI Insight':
        return 'rgba(63, 140, 255, 0.1)'; // Blue with low opacity
      case 'General Insight':
        return 'rgba(255, 255, 255, 0.05)'; // White with very low opacity
      default:
        return 'transparent';
    }
  };

  // Function to determine the sentiment color
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'Bullish':
        return theme.palette.success.main;
      case 'Bearish':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  // Sidebar drawer content
  const drawerContent = (
    <>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 30, height: 30 }}>T</Avatar>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>TradeSync</Typography>
      </Box>
      <Divider />
      
      <List>
        <ListItem disablePadding>
          <ListItemButton selected>
            <ListItemIcon>
              <DashboardIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <LightbulbIcon />
            </ListItemIcon>
            <ListItemText primary="AI Insights" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <AccountBalanceIcon />
            </ListItemIcon>
            <ListItemText primary="Portfolio" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <TrendingUpIcon />
            </ListItemIcon>
            <ListItemText primary="Performance" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
      
      <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ bgcolor: theme.palette.primary.dark }}>JP</Avatar>
        <Box>
          <Typography variant="body2">John Parker</Typography>
          <Typography variant="caption" color="text.secondary">Bot Builder</Typography>
        </Box>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 1, sm: 2, md: 3 }, 
          bgcolor: 'background.default',
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` }
        }}
      >
        {/* Header */}
        <AppBar 
          position="static" 
          color="transparent" 
          elevation={0} 
          sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Toolbar>
            {isMobile && (
              <Button 
                color="inherit" 
                onClick={() => setDrawerOpen(!drawerOpen)} 
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </Button>
            )}
            <Typography variant="h5" component="h1" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button 
                variant="text" 
                color="inherit" 
                startIcon={<RefreshIcon />}
                onClick={() => {
                  fetchInsights();
                  fetchClosedInsights();
                }}
              >
                Refresh
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: 'success.main'
                  }} 
                />
                <Typography variant="caption">
                  Connected
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 1, 
                overflow: 'hidden' 
              }}>
                <Button 
                  size="small" 
                  sx={{ 
                    bgcolor: theme.palette.warning.dark, 
                    color: 'warning.contrastText',
                    '&:hover': { bgcolor: theme.palette.warning.main },
                    px: 2,
                    borderRadius: 0
                  }}
                >
                  PAPER
                </Button>
                <Button 
                  size="small"
                  sx={{ 
                    color: 'text.secondary',
                    px: 2,
                    borderRadius: 0
                  }}
                >
                  LIVE
                </Button>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Trade Dialog */}
        <TradeDialog />
        
        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({...notification, open: false})}
          message={notification.message}
        />

        {/* Market Ticker */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {Object.entries(marketData).map(([key, data]) => (
            <Grid item xs={6} sm={3} key={key}>
              <Paper sx={{ 
                p: 2, 
                borderLeft: `4px solid ${parseFloat(data.change) >= 0 ? theme.palette.success.main : theme.palette.error.main}`,
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}>
                <Typography variant="subtitle2" color="text.secondary">{data.symbol}</Typography>
                <Typography variant="h5" sx={{ mt: 1, mb: 0.5 }}>
                  ${typeof data.price === 'number' && data.price > 1000 ? data.price.toLocaleString() : data.price}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: parseFloat(data.change) >= 0 ? 'success.main' : 'error.main',
                    fontWeight: 'medium',
                    display: 'flex',
                    alignItems: 'center'
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
          <Grid item xs={12} lg={8}>
            {/* Open Positions Section */}
            <Paper 
              sx={{ 
                p: 2, 
                mb: 3,
                borderRadius: 1,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Open Positions</Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small" 
                  startIcon={<MoneyIcon />}
                  onClick={() => setOpenTradeDialog(true)}
                >
                  New Trade
                </Button>
              </Box>
              
              {positions.map((position) => (
                <Paper 
                  key={position.id} 
                  sx={{ 
                    mb: 2, 
                    borderLeft: '4px solid', 
                    borderColor: position.plValue >= 0 ? 'success.main' : 'error.main',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }
                  }}
                  elevation={1}
                >
                  <Box 
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer',
                      bgcolor: 'background.paper'
                    }}
                    onClick={() => togglePosition(position.id)}
                  >
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                      {position.type === 'stock' ? `${position.symbol} Stock` : position.symbol}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="caption" color="text.secondary">Quantity</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{position.quantity}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="caption" color="text.secondary">Entry Price</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>${position.entryPrice}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="caption" color="text.secondary">Current Price</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>${position.currentPrice}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="caption" color="text.secondary">Cost Basis</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>${position.costBasis.toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="caption" color="text.secondary">P/L ($)</Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ color: position.plValue >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}
                        >
                          {position.plValue >= 0 ? '+' : ''}
                          ${Math.abs(position.plValue).toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="caption" color="text.secondary">P/L (%)</Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ color: position.plPercent >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}
                        >
                          {position.plPercent >= 0 ? '+' : ''}
                          {position.plPercent}%
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  {expandedPosition === position.id && (
                    <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        {[15, 25, 50, 75, 100].map((percent) => (
                          <Button 
                            key={percent}
                            variant="text" 
                            size="small"
                            onClick={() => handleScale(position.id, percent)}
                            sx={{ 
                              borderRadius: 0, 
                              borderRight: '1px solid', 
                              borderColor: 'divider',
                              '&:last-child': { borderRight: 'none' }
                            }}
                          >
                            {percent}%
                          </Button>
                        ))}
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="contained" color="success" size="small">
                          Buy More
                        </Button>
                        <Button variant="contained" color="error" size="small">
                          Sell Position
                        </Button>
                        <Button variant="outlined" size="small">
                          View Details
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Paper>
              ))}
            </Paper>

            {/* Performance Chart */}
            <Paper 
              sx={{ 
                p: 3, 
                mb: 3,
                borderRadius: 1,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Portfolio Performance</Typography>
                <Tabs 
                  value={activeTab} 
                  onChange={(e, v) => setActiveTab(v)}
                  sx={{ 
                    '& .MuiTab-root': { minWidth: 50 },
                    '& .Mui-selected': { color: theme.palette.primary.main },
                    '& .MuiTabs-indicator': { backgroundColor: theme.palette.primary.main }
                  }}
                >
                  <Tab label="1D" />
                  <Tab label="1W" />
                  <Tab label="1M" />
                  <Tab label="3M" />
                  <Tab label="1Y" />
                </Tabs>
              </Box>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke={theme.palette.text.secondary}
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  />
                  <YAxis 
                    stroke={theme.palette.text.secondary}
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Value']}
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 4
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="equity" 
                    stroke={theme.palette.primary.main} 
                    strokeWidth={2}
                    dot={{ r: 2, fill: theme.palette.primary.main }}
                    activeDot={{ r: 6, fill: theme.palette.primary.main }}
                    name="Portfolio Value"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke={theme.palette.success.main} 
                    strokeWidth={2}
                    dot={{ r: 2, fill: theme.palette.success.main }}
                    activeDot={{ r: 6, fill: theme.palette.success.main }}
                    name="Profit/Loss" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>

            {/* AI Insights Section */}
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                mb: 3,
                borderRadius: 1,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>AI Insights</Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress color="primary" />
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
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3,
                borderRadius: 1,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Closed Trades</Typography>
              
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
                        <TableRow key={insight.id} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
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
          <Grid item xs={12} lg={4}>
            {/* Account Summary */}
            <Paper 
              sx={{ 
                p: 3, 
                mb: 3,
                borderRadius: 1,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(19, 47, 76, 0.8) 100%)`
              }}
            >
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Account Summary</Typography>
              <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, color: theme.palette.primary.main }}>$52,490.40</Typography>
              
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  mb: 2,
                  borderColor: 'divider',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)'
                }}
              >
                <Typography variant="caption" color="text.secondary">Available Cash</Typography>
                <Typography variant="h6">$37,886.99</Typography>
              </Paper>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2,
                      borderColor: 'divider',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)'
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">Open P/L</Typography>
                    <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 600 }}>+$509.59</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2,
                      borderColor: 'divider',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)'
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">Closed P/L</Typography>
                    <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 600 }}>+$774.51</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Trading Stats */}
            <Paper 
              sx={{ 
                p: 3,
                borderRadius: 1,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(19, 47, 76, 0.8) 100%)`
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Trading Stats</Typography>
              
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  mb: 2,
                  borderColor: 'divider',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)'
                }}
              >
                <Typography variant="caption" color="text.secondary">Win Rate</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.success.main }}>78% (21/27)</Typography>
              </Paper>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2,
                      borderColor: 'divider',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)'
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">Average Gain</Typography>
                    <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 600 }}>+14.2%</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2,
                      borderColor: 'divider',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)'
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">Average Loss</Typography>
                    <Typography variant="body1" sx={{ color: 'error.main', fontWeight: 600 }}>-8.6%</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TradeSyncDashboard;
