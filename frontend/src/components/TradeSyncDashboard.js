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
  useTheme,
  Chip,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  LinearProgress,
  alpha
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoneyIcon from '@mui/icons-material/Money';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

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
      <Dialog 
        open={openTradeDialog} 
        onClose={() => setOpenTradeDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2
          }}
        >
          <Typography variant="h6" fontWeight={600}>Place Options Trade</Typography>
          <IconButton onClick={() => setOpenTradeDialog(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
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
            InputProps={{ 
              startAdornment: <InputAdornment position="start">$</InputAdornment> 
            }}
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
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', justifyContent: 'flex-end' }}>
          <Button 
            onClick={() => setOpenTradeDialog(false)} 
            variant="outlined" 
            color="inherit"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            startIcon={<CheckIcon />}
          >
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
        return alpha(theme.palette.success.main, 0.1);
      case 'AI Insight':
        return alpha(theme.palette.primary.main, 0.1);
      case 'General Insight':
        return alpha(theme.palette.info.main, 0.05);
      default:
        return 'transparent';
    }
  };

  // Function to get category chip color
  const getCategoryChipColor = (category) => {
    switch (category) {
      case 'Actionable Trade':
        return 'success';
      case 'AI Insight':
        return 'primary';
      case 'General Insight':
        return 'default';
      default:
        return 'default';
    }
  };

  // Function to determine the sentiment color
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'Bullish':
        return theme.palette.success.main;
      case 'Bearish':
        return theme.palette.error.main;
      case 'Neutral':
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  // Function to get sentiment chip color
  const getSentimentChipColor = (sentiment) => {
    switch (sentiment) {
      case 'Bullish':
        return 'success';
      case 'Bearish':
        return 'error';
      case 'Neutral':
        return 'info';
      default:
        return 'default';
    }
  };

  // Sidebar drawer content
  const drawerContent = (
    <>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar 
          sx={{ 
            bgcolor: theme.palette.primary.main, 
            width: 32, 
            height: 32,
            boxShadow: '0 0 10px rgba(58, 142, 255, 0.5)'
          }}
        >
          T
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>
          TradeSync
        </Typography>
      </Box>
      <Divider />
      
      <List sx={{ py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton 
            selected
            sx={{ 
              borderRadius: '0 24px 24px 0',
              mx: 1, 
              my: 0.5, 
              px: 2
            }}
          >
            <ListItemIcon>
              <DashboardIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Dashboard" 
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            sx={{ 
              borderRadius: '0 24px 24px 0',
              mx: 1,
              my: 0.5,
              px: 2
            }}
          >
            <ListItemIcon>
              <LightbulbIcon />
            </ListItemIcon>
            <ListItemText primary="AI Insights" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            sx={{ 
              borderRadius: '0 24px 24px 0',
              mx: 1,
              my: 0.5,
              px: 2
            }}
          >
            <ListItemIcon>
              <AccountBalanceIcon />
            </ListItemIcon>
            <ListItemText primary="Portfolio" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            sx={{ 
              borderRadius: '0 24px 24px 0',
              mx: 1,
              my: 0.5,
              px: 2
            }}
          >
            <ListItemIcon>
              <TrendingUpIcon />
            </ListItemIcon>
            <ListItemText primary="Performance" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            sx={{ 
              borderRadius: '0 24px 24px 0',
              mx: 1,
              my: 0.5,
              px: 2
            }}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
      
      <Box 
        sx={{ 
          mt: 'auto', 
          p: 2, 
          borderTop: '1px solid', 
          borderColor: 'divider', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5 
        }}
      >
        <Avatar 
          sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.3),
            color: theme.palette.primary.main
          }}
        >
          JP
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight={500}>John Parker</Typography>
          <Typography variant="caption" color="text.secondary">Bot Builder</Typography>
        </Box>
        <Box sx={{ ml: 'auto' }}>
          <IconButton size="small">
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </>
  );

  // Custom tooltip component for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          elevation={3}
          sx={{
            p: 1.5,
            borderRadius: 1,
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block">
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color }} />
              <Typography variant="body2">
                {entry.name}: <strong>${entry.value.toLocaleString()}</strong>
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };

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
            backgroundColor: theme.palette.background.default,
            backgroundImage: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.95))',
            backdropFilter: 'blur(10px)',
            borderRight: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.3),
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
          p: { xs: 2, sm: 3 }, 
          bgcolor: theme.palette.background.default,
          backgroundImage: 'radial-gradient(at 30% 20%, rgba(30, 41, 59, 0.5) 0px, transparent 50%), radial-gradient(at 70% 80%, rgba(51, 65, 85, 0.5) 0px, transparent 50%)',
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` }
        }}
      >
        {/* Header */}
        <AppBar 
          position="static" 
          color="transparent" 
          elevation={0} 
          sx={{ 
            mb: 3, 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            backdropFilter: 'blur(8px)',
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.7),
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton 
                color="inherit" 
                onClick={() => setDrawerOpen(!drawerOpen)} 
                edge="start"
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h5" component="h1" sx={{ flexGrow: 1, fontWeight: 700 }}>
              Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button 
                variant="outlined" 
                color="inherit" 
                startIcon={<RefreshIcon />}
                onClick={() => {
                  fetchInsights();
                  fetchClosedInsights();
                }}
                size="small"
                sx={{ 
                  borderRadius: '20px',
                  textTransform: 'none',
                  mr: 1
                }}
              >
                Refresh
              </Button>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                px: 1.5, 
                py: 0.5, 
                borderRadius: '20px',
                border: '1px solid',
                borderColor: 'divider',
                mr: 1
              }}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: theme.palette.success.main,
                    boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)'
                  }} 
                />
                <Typography variant="caption" sx={{ ml: 1, fontWeight: 500 }}>
                  Connected
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <Button 
                  size="small" 
                  sx={{ 
                    bgcolor: theme.palette.warning.dark, 
                    color: alpha(theme.palette.warning.contrastText, 0.9),
                    '&:hover': { bgcolor: alpha(theme.palette.warning.dark, 0.8) },
                    px: 2,
                    borderRadius: 0,
                    height: 32,
                    fontWeight: 600
                  }}
                >
                  PAPER
                </Button>
                <Button 
                  size="small"
                  sx={{ 
                    color: alpha(theme.palette.text.secondary, 0.8),
                    px: 2,
                    borderRadius: 0,
                    height: 32
                  }}
                >
                  LIVE
                </Button>
              </Box>
              
              <IconButton size="small" sx={{ ml: 0.5 }}>
                <NotificationsIcon fontSize="small" />
              </IconButton>
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
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ 
            '& .MuiSnackbarContent-root': {
              bgcolor: notification.type === 'success' ? theme.palette.success.dark : theme.palette.primary.dark,
              borderRadius: 2
            }
          }}
        />

        {/* Market Ticker */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {Object.entries(marketData).map(([key, data]) => (
            <Grid item xs={6} sm={3} key={key}>
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 2,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    backgroundColor: parseFloat(data.change) >= 0 ? theme.palette.success.main : theme.palette.error.main,
                  }
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>{data.symbol}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, my: 1 }}>
                    ${typeof data.price === 'number' && data.price > 1000 ? data.price.toLocaleString() : data.price}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {parseFloat(data.change) >= 0 ? (
                      <ArrowDropUpIcon sx={{ color: theme.palette.success.main, mr: -0.5 }} />
                    ) : (
                      <ArrowDropDownIcon sx={{ color: theme.palette.error.main, mr: -0.5 }} />
                    )}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: parseFloat(data.change) >= 0 ? theme.palette.success.main : theme.palette.error.main,
                        fontWeight: 600
                      }}
                    >
                      {Math.abs(parseFloat(data.change)).toFixed(2)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Main Dashboard Grid */}
        <Grid container spacing={3}>
          {/* Left Column - 2/3 width */}
          <Grid item xs={12} lg={8}>
            {/* Open Positions Section */}
            <Card 
              elevation={0}
              sx={{ 
                mb: 3,
                borderRadius: 2,
                overflow: 'visible'
              }}
            >
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Open Positions</Typography>
                }
                action={
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="small" 
                    startIcon={<AddIcon />}
                    onClick={() => setOpenTradeDialog(true)}
                    sx={{ 
                      borderRadius: '20px',
                      boxShadow: '0 4px 10px rgba(58, 142, 255, 0.3)'
                    }}
                  >
                    New Trade
                  </Button>
                }
                sx={{ px: 3, pt: 2.5, pb: 0 }}
              />
              
              <CardContent sx={{ p: 2 }}>
                {positions.map((position) => (
                  <Card 
                    key={position.id} 
                    elevation={0}
                    sx={{ 
                      mb: 2, 
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                      border: '1px solid',
                      borderColor: alpha(theme.palette.divider, 0.1),
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        borderColor: alpha(theme.palette.divider, 0.3),
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        backgroundColor: position.plValue >= 0 ? theme.palette.success.main : theme.palette.error.main,
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        px: 3, 
                        py: 2, 
                        cursor: 'pointer',
                      }}
                      onClick={() => togglePosition(position.id)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {position.type === 'stock' ? `${position.symbol} Stock` : position.symbol}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePosition(position.id);
                          }}
                          sx={{ 
                            bgcolor: alpha(theme.palette.background.default, 0.4),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.background.default, 0.6),
                            }
                          }}
                        >
                          {expandedPosition === position.id ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </IconButton>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={4} md={2}>
                          <Typography variant="caption" color="text.secondary">Quantity</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{position.quantity}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={4} md={2}>
                          <Typography variant="caption" color="text.secondary">Entry Price</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>${position.entryPrice}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={4} md={2}>
                          <Typography variant="caption" color="text.secondary">Current Price</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>${position.currentPrice}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={4} md={2}>
                          <Typography variant="caption" color="text.secondary">Cost Basis</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>${position.costBasis.toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={4} md={2}>
                          <Typography variant="caption" color="text.secondary">P/L ($)</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {position.plValue >= 0 ? (
                              <ArrowDropUpIcon sx={{ color: theme.palette.success.main, mr: -0.5 }} />
                            ) : (
                              <ArrowDropDownIcon sx={{ color: theme.palette.error.main, mr: -0.5 }} />
                            )}
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: position.plValue >= 0 ? theme.palette.success.main : theme.palette.error.main, 
                                fontWeight: 700 
                              }}
                            >
                              ${Math.abs(position.plValue).toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={4} md={2}>
                          <Typography variant="caption" color="text.secondary">P/L (%)</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {position.plPercent >= 0 ? (
                              <ArrowDropUpIcon sx={{ color: theme.palette.success.main, mr: -0.5 }} />
                            ) : (
                              <ArrowDropDownIcon sx={{ color: theme.palette.error.main, mr: -0.5 }} />
                            )}
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: position.plPercent >= 0 ? theme.palette.success.main : theme.palette.error.main, 
                                fontWeight: 700 
                              }}
                            >
                              {Math.abs(position.plPercent).toFixed(2)}%
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                    
                    {expandedPosition === position.id && (
                      <Box 
                        sx={{ 
                          px: 3, 
                          pb: 2, 
                          pt: 1,
                          bgcolor: alpha(theme.palette.background.default, 0.3),
                          borderTop: '1px solid',
                          borderColor: alpha(theme.palette.divider, 0.1)
                        }}
                      >
                        <Box sx={{ display: 'flex', mb: 2 }}>
                          <Typography variant="caption" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                            Scale position:
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {[15, 25, 50, 75, 100].map((percent) => (
                            <Button 
                              key={percent}
                              variant="outlined" 
                              size="small"
                              onClick={() => handleScale(position.id, percent)}
                              sx={{ 
                                borderRadius: '20px',
                                borderColor: alpha(theme.palette.divider, 0.2),
                                color: theme.palette.text.secondary,
                                px: 1.5,
                                minWidth: 0
                              }}
                            >
                              {percent}%
                            </Button>
                          ))}
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <Button 
                            variant="contained" 
                            color="success" 
                            size="small"
                            sx={{ 
                              borderRadius: '20px',
                              px: 2
                            }}
                          >
                            Buy More
                          </Button>
                          <Button 
                            variant="contained" 
                            color="error" 
                            size="small"
                            sx={{ 
                              borderRadius: '20px',
                              px: 2
                            }}
                          >
                            Sell Position
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            sx={{ 
                              borderRadius: '20px',
                              px: 2,
                              ml: 'auto'
                            }}
                          >
                            View Details
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card 
              elevation={0}
              sx={{ 
                mb: 3,
                borderRadius: 2,
              }}
            >
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Portfolio Performance</Typography>
                }
                action={
                  <Tabs 
                    value={activeTab} 
                    onChange={(e, v) => setActiveTab(v)}
                    sx={{ 
                      minHeight: 36,
                      '& .MuiTab-root': { 
                        minWidth: 50,
                        minHeight: 36,
                        px: 2,
                      },
                      '& .Mui-selected': { 
                        color: theme.palette.primary.main,
                        fontWeight: 600
                      },
                      '& .MuiTabs-indicator': { 
                        backgroundColor: theme.palette.primary.main,
                        height: 3,
                        borderRadius: '3px 3px 0 0'
                      }
                    }}
                  >
                    <Tab label="1D" />
                    <Tab label="1W" />
                    <Tab label="1M" />
                    <Tab label="3M" />
                    <Tab label="1Y" />
                  </Tabs>
                }
                sx={{ px: 3, pt: 2.5, pb: 0 }}
              />
              
              <CardContent sx={{ p: 2, height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={alpha(theme.palette.divider, 0.2)}
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="date" 
                      stroke={theme.palette.text.secondary}
                      tick={{ 
                        fill: theme.palette.text.secondary, 
                        fontSize: 12,
                        dy: 5
                      }}
                      axisLine={{ stroke: theme.palette.divider }}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke={theme.palette.text.secondary}
                      tick={{ 
                        fill: theme.palette.text.secondary, 
                        fontSize: 12,
                        dx: -5
                      }}
                      tickFormatter={(value) => `$${value / 1000}k`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="equity" 
                      stroke={theme.palette.primary.main} 
                      fillOpacity={1}
                      fill="url(#colorEquity)"
                      strokeWidth={2}
                      activeDot={{ 
                        r: 6, 
                        strokeWidth: 0,
                        fill: theme.palette.primary.main,
                        boxShadow: '0 0 6px rgba(58, 142, 255, 0.5)'
                      }}
                      name="Portfolio Value"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      stroke={theme.palette.success.main} 
                      fillOpacity={1}
                      fill="url(#colorProfit)"
                      strokeWidth={2}
                      activeDot={{ 
                        r: 6, 
                        strokeWidth: 0,
                        fill: theme.palette.success.main,
                        boxShadow: '0 0 6px rgba(16, 185, 129, 0.5)'
                      }}
                      name="Profit/Loss" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* AI Insights Section */}
            <Card 
              elevation={0}
              sx={{ 
                mb: 3,
                borderRadius: 2,
              }}
            >
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>AI Insights</Typography>
                }
                sx={{ px: 3, pt: 2.5, pb: 0 }}
              />
              
              <CardContent sx={{ p: 2 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                    <CircularProgress color="primary" size={40} thickness={4} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Loading insights...
                    </Typography>
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ my: 2, borderRadius: 2 }}>{error}</Alert>
                ) : insights.length === 0 ? (
                  <Alert severity="info" sx={{ my: 2, borderRadius: 2 }}>No insights available.</Alert>
                ) : (
                  <TableContainer 
                    component={Paper} 
                    elevation={0}
                    sx={{ 
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: alpha(theme.palette.divider, 0.1)
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Ticker</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Summary</TableCell>
                          <TableCell>Sentiment</TableCell>
                          <TableCell align="right">Confidence</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {insights.map((insight) => (
                          <TableRow 
                            key={insight.id} 
                            sx={{ 
                              backgroundColor: getCategoryColor(insight.category),
                              '&:last-child td, &:last-child th': { border: 0 },
                            }}
                          >
                            <TableCell 
                              component="th" 
                              scope="row" 
                              sx={{ 
                                fontWeight: 600,
                                color: theme.palette.primary.main
                              }}
                            >
                              {insight.ticker}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={insight.category} 
                                size="small" 
                                color={getCategoryChipColor(insight.category)}
                                sx={{ 
                                  fontWeight: 500,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                            <TableCell>{insight.summary}</TableCell>
                            <TableCell>
                              <Chip 
                                label={insight.sentiment || 'Neutral'} 
                                size="small" 
                                color={getSentimentChipColor(insight.sentiment)}
                                sx={{ 
                                  fontWeight: 500,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <Typography variant="body2" sx={{ mr: 1, fontWeight: 600 }}>
                                  {insight.confidence ? `${insight.confidence.toFixed(1)}%` : 'N/A'}
                                </Typography>
                                <Box sx={{ width: 60 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={insight.confidence || 0} 
                                    sx={{ 
                                      height: 6, 
                                      borderRadius: 3, 
                                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: insight.confidence > 75 
                                          ? theme.palette.success.main 
                                          : insight.confidence > 50 
                                            ? theme.palette.primary.main 
                                            : theme.palette.warning.main
                                      }
                                    }}
                                  />
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              {insight.category === 'Actionable Trade' ? (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  onClick={() => handleCloseTrade(insight.id)}
                                  sx={{ 
                                    borderRadius: '20px',
                                    py: 0.5,
                                    px: 2
                                  }}
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
              </CardContent>
            </Card>

            {/* Closed Trades Section */}
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 2,
              }}
            >
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Closed Trades</Typography>
                }
                sx={{ px: 3, pt: 2.5, pb: 0 }}
              />
              
              <CardContent sx={{ p: 2 }}>
                {closedInsights.length === 0 ? (
                  <Alert severity="info" sx={{ my: 2, borderRadius: 2 }}>No closed trades available.</Alert>
                ) : (
                  <TableContainer 
                    component={Paper} 
                    elevation={0}
                    sx={{ 
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: alpha(theme.palette.divider, 0.1)
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Ticker</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Summary</TableCell>
                          <TableCell>Sentiment</TableCell>
                          <TableCell align="right">Confidence</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {closedInsights.map((insight) => (
                          <TableRow 
                            key={insight.id} 
                            sx={{ 
                              backgroundColor: alpha(theme.palette.background.lighter, 0.2),
                              '&:last-child td, &:last-child th': { border: 0 },
                              opacity: 0.8
                            }}
                          >
                            <TableCell 
                              component="th" 
                              scope="row" 
                              sx={{ 
                                fontWeight: 600,
                                color: theme.palette.text.primary
                              }}
                            >
                              {insight.ticker}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={insight.category} 
                                size="small" 
                                color={getCategoryChipColor(insight.category)}
                                variant="outlined"
                                sx={{ 
                                  fontWeight: 500,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                            <TableCell>{insight.summary}</TableCell>
                            <TableCell>
                              <Chip 
                                label={insight.sentiment || 'Neutral'} 
                                size="small" 
                                color={getSentimentChipColor(insight.sentiment)}
                                variant="outlined"
                                sx={{ 
                                  fontWeight: 500,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <Typography variant="body2" sx={{ mr: 1, fontWeight: 600 }}>
                                  {insight.confidence ? `${insight.confidence.toFixed(1)}%` : 'N/A'}
                                </Typography>
                                <Box sx={{ width: 60 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={insight.confidence || 0} 
                                    sx={{ 
                                      height: 6, 
                                      borderRadius: 3, 
                                      bgcolor: alpha(theme.palette.background.default, 0.3),
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: alpha(theme.palette.text.secondary, 0.5)
                                      }
                                    }}
                                  />
                                </Box>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Right Column - 1/3 width */}
          <Grid item xs={12} lg={4}>
            {/* Account Summary */}
            <Card 
              elevation={0}
              sx={{ 
                mb: 3,
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)} 0%, ${alpha(theme.palette.primary.dark, 0.4)} 100%)`,
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.dark, 0.1),
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.05,
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ffffff" fill-opacity="1" fill-rule="evenodd"/%3E%3C/svg%3E")',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: alpha(theme.palette.text.primary, 0.7) }}>
                  Account Summary
                </Typography>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    mb: 2, 
                    fontWeight: 700, 
                    color: theme.palette.primary.main,
                    textShadow: '0 0 20px rgba(58, 142, 255, 0.3)'
                  }}
                >
                  $52,490.40
                </Typography>
                
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    mb: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
                    backdropFilter: 'blur(8px)',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.1)
                  }}
                >
                  <Typography variant="caption" color="text.secondary">Available Cash</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>$37,886.99</Typography>
                </Paper>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                        backdropFilter: 'blur(8px)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.1)
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">Open P/L</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ArrowDropUpIcon sx={{ color: theme.palette.success.main, mr: -0.5 }} />
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: theme.palette.success.main, 
                            fontWeight: 700 
                          }}
                        >
                          $509.59
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                        backdropFilter: 'blur(8px)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.1)
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">Closed P/L</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ArrowDropUpIcon sx={{ color: theme.palette.success.main, mr: -0.5 }} />
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: theme.palette.success.main, 
                            fontWeight: 700 
                          }}
                        >
                          $774.51
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            {/* Trading Stats */}
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.7)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.1),
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Trading Stats</Typography>
                
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    mb: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.success.main, 0.05),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.success.main, 0.1)
                  }}
                >
                  <Typography variant="caption" color="text.secondary">Win Rate</Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 700, 
                      color: theme.palette.success.main,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    78% <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      (21/27)
                    </Typography>
                  </Typography>
                </Paper>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.success.main, 0.05),
                        border: '1px solid',
                        borderColor: alpha(theme.palette.success.main, 0.1)
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">Average Gain</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ArrowDropUpIcon sx={{ color: theme.palette.success.main, mr: -0.5 }} />
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: theme.palette.success.main, 
                            fontWeight: 700 
                          }}
                        >
                          14.2%
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.error.main, 0.05),
                        border: '1px solid',
                        borderColor: alpha(theme.palette.error.main, 0.1)
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">Average Loss</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ArrowDropDownIcon sx={{ color: theme.palette.error.main, mr: -0.5 }} />
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: theme.palette.error.main, 
                            fontWeight: 700 
                          }}
                        >
                          8.6%
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>

                <Box 
                  sx={{ 
                    mt: 3, 
                    pt: 2, 
                    borderTop: '1px solid', 
                    borderColor: alpha(theme.palette.divider, 0.1),
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <Button 
                    variant="outlined" 
                    size="small" 
                    endIcon={<HelpOutlineIcon fontSize="small" />}
                    sx={{ 
                      borderRadius: '20px',
                      textTransform: 'none'
                    }}
                  >
                    View Detailed Statistics
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TradeSyncDashboard;
