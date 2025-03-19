import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  Button,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tab,
  Tabs,
  CircularProgress,
  Alert
} from '@mui/material';

// Import icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const drawerWidth = 240;

const TradeSyncDashboard = () => {
  // State management
  const [expandedPosition, setExpandedPosition] = useState(null);
  const wsRef = useRef(null);
  
  // Initialize data states
  const [marketData, setMarketData] = useState({
    SPY: { symbol: 'SPY', price: 483.58, change: 1.8 },
    QQQ: { symbol: 'QQQ', price: 418.27, change: 1.7 },
    VIX: { symbol: 'VIX', price: 14.77, change: -5.2 },
    AAPL: { symbol: 'AAPL', price: 213.18, change: 0.8 },
    BTC: { symbol: 'BTC', price: 68474, change: 2.5 }
  });
  
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
  
  const [accountSummary, setAccountSummary] = useState({
    totalValue: 52490.40,
    availableCash: 37886.99,
    openPL: 509.59,
    closedPL: 774.51
  });

  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [insightTab, setInsightTab] = useState(0);
  const [performanceTab, setPerformanceTab] = useState(0);

  const togglePosition = (id) => {
    setExpandedPosition(expandedPosition === id ? null : id);
  };

  // Function to handle scaling a position
  const handleScale = (positionId, percentage) => {
    console.log(`Scaling position ${positionId} by ${percentage}%`);
    // Here you would implement the actual scaling logic
  };

  // Function to get color based on value (positive/negative)
  const getValueColor = (value) => {
    return value >= 0 ? 'success.main' : 'error.main';
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
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
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 30, height: 30 }}>T</Avatar>
          <Typography variant="h6">TradeSync</Typography>
        </Box>
        <Divider />
        
        <List>
          <ListItem disablePadding>
            <ListItemButton selected>
              <ListItemIcon>
                <DashboardIcon />
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
          <Avatar>JP</Avatar>
          <Box>
            <Typography variant="body2">John Parker</Typography>
            <Typography variant="caption" color="text.secondary">Bot Builder</Typography>
          </Box>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}>
        {/* Header */}
        <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Toolbar>
            <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
              Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: connectionStatus === 'connected' ? 'success.main' : 
                              connectionStatus === 'error' ? 'error.main' : 'warning.main' 
                  }} 
                />
                <Typography variant="caption">
                  {connectionStatus === 'connected' ? 'Connected' : 
                   connectionStatus === 'error' ? 'Connection Error' : 'Connecting...'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                <Button 
                  size="small" 
                  sx={{ 
                    bgcolor: 'warning.main', 
                    color: 'warning.contrastText',
                    '&:hover': { bgcolor: 'warning.dark' },
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

        {/* Market Ticker */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {Object.entries(marketData).map(([key, data]) => (
            <Grid item xs={6} sm={4} md={2} key={key}>
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
          <Grid item xs={6} sm={4} md={2}>
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Button color="primary" variant="text">View All Markets</Button>
            </Box>
          </Grid>
        </Grid>

        {/* Main Dashboard Grid */}
        <Grid container spacing={3}>
          {/* Left Column - 2/3 width */}
          <Grid item xs={12} lg={8}>
            {/* Positions Section */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Open Positions</Typography>
                <Button variant="contained" color="primary" size="small" startIcon={<span>+</span>}>
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
                    overflow: 'hidden'
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
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      {position.type === 'stock' ? `${position.symbol} Stock` : position.symbol}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="caption" color="text.secondary">Quantity</Typography>
                        <Typography variant="body2">{position.quantity}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="caption" color="text.secondary">Entry Price</Typography>
                        <Typography variant="body2">${position.entryPrice}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="caption" color="text.secondary">Current Price</Typography>
                        <Typography variant="body2">${position.currentPrice}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="caption" color="text.secondary">Cost Basis</Typography>
                        <Typography variant="body2">${position.costBasis.toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="caption" color="text.secondary">P/L ($)</Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ color: getValueColor(position.plValue) }}
                        >
                          {position.plValue >= 0 ? '+' : ''}
                          ${Math.abs(position.plValue).toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="caption" color="text.secondary">P/L (%)</Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ color: getValueColor(position.plPercent) }}
                        >
                          {position.plPercent >= 0 ? '+' : ''}
                          {position.plPercent}%
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {expandedPosition === position.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Box>
                  </Box>
                  
                  {expandedPosition === position.id && (
                    <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
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

            {/* AI Insights Section */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>AI Trade Insights</Typography>
              
              <Tabs 
                value={insightTab} 
                onChange={(e, newValue) => setInsightTab(newValue)} 
                sx={{ mb: 2, bgcolor: 'action.hover', borderRadius: 1 }}
                variant="fullWidth"
              >
                <Tab label="All Insights" />
                <Tab label="Technical" />
                <Tab label="News" />
                <Tab label="Fundamental" />
              </Tabs>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Sentiment:</Typography>
                <Chip 
                  label="Bullish" 
                  size="small"
                  color="success" 
                  variant="outlined"
                  sx={{ bgcolor: 'success.main', bgcolor: 'rgba(63, 185, 80, 0.1)' }}
                />
                <Chip 
                  label="Bearish" 
                  size="small"
                  sx={{ color: 'error.main', bgcolor: 'rgba(248, 81, 73, 0.1)' }}
                />
                <Chip 
                  label="Neutral" 
                  size="small"
                  sx={{ color: 'text.secondary', bgcolor: 'rgba(139, 148, 158, 0.1)' }}
                />
              </Box>
              
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  borderLeft: '4px solid', 
                  borderColor: 'success.main'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">HOOD</Typography>
                    <Chip 
                      label="Actionable Trade" 
                      size="small"
                      sx={{ color: 'success.main', bgcolor: 'rgba(63, 185, 80, 0.1)' }}
                    />
                  </Box>
                  <Chip 
                    label="85%" 
                    size="small"
                    sx={{ color: 'success.main', bgcolor: 'rgba(63, 185, 80, 0.1)' }}
                  />
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Buy above $24.5, stop below today's low. Looking for a move to $28 based on volume pattern and support levels. Watching for a breakout above the daily resistance.
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'success.main' }}>SN</Avatar>
                    <Typography variant="caption">@ripster47</Typography>
                    <Typography variant="caption" color="text.secondary">47 min ago</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="contained" color="success" size="small">Buy Now</Button>
                    <Button variant="contained" color="error" size="small">Sell Now</Button>
                    <Button variant="outlined" size="small">View Details</Button>
                  </Box>
                </Box>
              </Paper>
            </Paper>
          </Grid>

          {/* Right Column - 1/3 width */}
          <Grid item xs={12} lg={4}>
            {/* Account Summary */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Account Summary</Typography>
              <Typography variant="h4" sx={{ mb: 2 }}>${accountSummary.totalValue.toLocaleString()}</Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Available Cash</Typography>
                <Typography variant="h6">${accountSummary.availableCash.toLocaleString()}</Typography>
              </Paper>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">Open P/L</Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ color: getValueColor(accountSummary.openPL) }}
                    >
                      {accountSummary.openPL >= 0 ? '+' : ''}
                      ${accountSummary.openPL.toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">Closed P/L</Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ color: getValueColor(accountSummary.closedPL) }}
                    >
                      {accountSummary.closedPL >= 0 ? '+' : ''}
                      ${accountSummary.closedPL.toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Performance Section */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Performance</Typography>
              
              <Tabs 
                value={performanceTab} 
                onChange={(e, newValue) => setPerformanceTab(newValue)} 
                sx={{ mb: 2, bgcolor: 'action.hover', borderRadius: 8 }}
                variant="fullWidth"
              >
                <Tab label="1D" />
                <Tab label="1W" />
                <Tab label="1M" />
                <Tab label="3M" />
                <Tab label="1Y" />
              </Tabs>
              
              <Paper 
                variant="outlined" 
                sx={{ 
                  height: 100, 
                  position: 'relative',
                  bgcolor: 'rgba(63, 185, 80, 0.05)',
                  mb: 2
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    position: 'absolute', 
                    top: 10, 
                    right: 10,
                    color: 'success.main' 
                  }}
                >
                  +2.45%
                </Typography>
              </Paper>
            </Paper>
            
            {/* Trading Stats */}
            <Paper sx={{ p: 2 }}>
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
      </Box>
    </Box>
  );
};

export default TradeSyncDashboard;
