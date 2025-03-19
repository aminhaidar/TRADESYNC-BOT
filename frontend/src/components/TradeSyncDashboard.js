import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardHeader, CardContent, 
  Button, Drawer, AppBar, Toolbar, Avatar, Divider, IconButton,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Tabs, Tab, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Alert, CircularProgress, Snackbar, alpha,
  useTheme, useMediaQuery
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const drawerWidth = 240;

const TradeSyncDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });
  const [openTradeDialog, setOpenTradeDialog] = useState(false);
  
  // Market data
  const [marketData, setMarketData] = useState({
    SPY: { symbol: 'SPY', price: 483.58, change: 1.8 },
    QQQ: { symbol: 'QQQ', price: 418.27, change: 1.7 },
    AAPL: { symbol: 'AAPL', price: 213.18, change: 0.8 },
    BTC: { symbol: 'BTC', price: 68474, change: 2.5 }
  });
  
  // Mock performance data
  const performanceData = [
    { date: '03/12/2025', equity: 51000, profit: -500 },
    { date: '03/13/2025', equity: 51200, profit: -300 },
    { date: '03/14/2025', equity: 51500, profit: 0 },
    { date: '03/15/2025', equity: 51800, profit: 300 },
    { date: '03/16/2025', equity: 52100, profit: 600 },
    { date: '03/17/2025', equity: 52300, profit: 800 },
    { date: '03/18/2025', equity: 52490, profit: 990 }
  ];
  
  // Mock insights data
  const insights = [
    {
      id: 1,
      ticker: "$BTC",
      category: "Actionable Trade",
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
      sentiment: "Bullish", 
      summary: "NVDA building momentum for breakout above 950.",
      confidence: 78.5,
      source: "@techtrader",
      timestamp: "March 19, 2025 at 10:15AM"
    }
  ];
  
  // Mock positions data
  const positions = [
    { 
      id: 'aapl', 
      symbol: 'AAPL', 
      type: 'stock', 
      quantity: 10, 
      entryPrice: 211.80, 
      currentPrice: 213.25, 
      plValue: 14.50, 
      plPercent: 0.7
    },
    { 
      id: 'tsla', 
      symbol: 'TSLA', 
      type: 'stock', 
      quantity: 15, 
      entryPrice: 180.50, 
      currentPrice: 177.82, 
      plValue: -40.20, 
      plPercent: -1.5
    }
  ];
  
  // Drawer content
  const drawerContent = (
    <>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>T</Avatar>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>TradeSync</Typography>
      </Box>
      <Divider />
      
      <List sx={{ py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton selected>
            <ListItemIcon><DashboardIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon><LightbulbIcon /></ListItemIcon>
            <ListItemText primary="AI Insights" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon><AccountBalanceIcon /></ListItemIcon>
            <ListItemText primary="Portfolio" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon><TrendingUpIcon /></ListItemIcon>
            <ListItemText primary="Performance" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  // Market ticker component
  const MarketTicker = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {Object.entries(marketData).map(([key, data]) => (
        <Grid item xs={6} sm={3} key={key}>
          <Card sx={{ height: '100%', position: 'relative', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">{data.symbol}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, my: 1 }}>
                ${typeof data.price === 'number' && data.price > 1000 ? data.price.toLocaleString() : data.price}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {parseFloat(data.change) >= 0 ? (
                  <ArrowDropUpIcon sx={{ color: theme.palette.success.main }} />
                ) : (
                  <ArrowDropDownIcon sx={{ color: theme.palette.error.main }} />
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
  );

  // Performance chart component
  const PerformanceChart = () => (
    <Card sx={{ mb: 3, borderRadius: 2 }}>
      <CardHeader
        title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Portfolio Performance</Typography>}
        action={
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab label="1D" />
            <Tab label="1W" />
            <Tab label="1M" />
            <Tab label="3M" />
            <Tab label="1Y" />
          </Tabs>
        }
      />
      <CardContent sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.2)} />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="equity" 
              stroke={theme.palette.primary.main}
              fill={alpha(theme.palette.primary.main, 0.1)}
              name="Portfolio Value"
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              stroke={theme.palette.success.main}
              fill={alpha(theme.palette.success.main, 0.1)}
              name="Profit/Loss" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  // Open positions component
  const OpenPositions = () => (
    <Card sx={{ mb: 3, borderRadius: 2 }}>
      <CardHeader
        title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Open Positions</Typography>}
        action={
          <Button 
            variant="contained" 
            color="primary" 
            size="small" 
            startIcon={<AddIcon />}
            onClick={() => setOpenTradeDialog(true)}
          >
            New Trade
          </Button>
        }
      />
      <CardContent>
        {positions.map((position) => (
          <Card key={position.id} sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {position.type === 'stock' ? `${position.symbol} Stock` : position.symbol}
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Quantity</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{position.quantity}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Entry Price</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>${position.entryPrice}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Current Price</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>${position.currentPrice}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">P/L</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {position.plValue >= 0 ? (
                      <ArrowDropUpIcon sx={{ color: theme.palette.success.main }} />
                    ) : (
                      <ArrowDropDownIcon sx={{ color: theme.palette.error.main }} />
                    )}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: position.plValue >= 0 ? theme.palette.success.main : theme.palette.error.main, 
                        fontWeight: 700 
                      }}
                    >
                      ${Math.abs(position.plValue).toFixed(2)} ({Math.abs(position.plPercent).toFixed(2)}%)
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );

  // AI Insights component
  const AIInsights = () => (
    <Card sx={{ mb: 3, borderRadius: 2 }}>
      <CardHeader
        title={<Typography variant="h6" sx={{ fontWeight: 700 }}>AI Insights</Typography>}
      />
      <CardContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ticker</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Summary</TableCell>
                  <TableCell>Sentiment</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {insights.map((insight) => (
                  <TableRow key={insight.id}>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                      {insight.ticker}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={insight.category} 
                        size="small" 
                        color={insight.category === "Actionable Trade" ? "success" : "primary"}
                      />
                    </TableCell>
                    <TableCell>{insight.summary}</TableCell>
                    <TableCell>
                      <Chip 
                        label={insight.sentiment} 
                        size="small" 
                        color={insight.sentiment === "Bullish" ? "success" : 
                               insight.sentiment === "Bearish" ? "error" : "default"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );

  // Account Summary component
  const AccountSummary = () => (
    <Card sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          Account Summary
        </Typography>
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, color: theme.palette.primary.main }}>
          $52,490.40
        </Typography>
        
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">Available Cash</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>$37,886.99</Typography>
        </Paper>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">Open P/L</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ArrowDropUpIcon sx={{ color: theme.palette.success.main }} />
                <Typography variant="body1" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
                  $509.59
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">Closed P/L</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ArrowDropUpIcon sx={{ color: theme.palette.success.main }} />
                <Typography variant="body1" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
                  $774.51
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Trading Stats component
  const TradingStats = () => (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Trading Stats</Typography>
        
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">Win Rate</Typography>
          <Typography variant="body1" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
            78% <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              (21/27)
            </Typography>
          </Typography>
        </Paper>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">Average Gain</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ArrowDropUpIcon sx={{ color: theme.palette.success.main }} />
                <Typography variant="body1" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
                  14.2%
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">Average Loss</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ArrowDropDownIcon sx={{ color: theme.palette.error.main }} />
                <Typography variant="body1" sx={{ color: theme.palette.error.main, fontWeight: 700 }}>
                  8.6%
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
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
            backgroundColor: theme.palette.background.default,
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
                size="small"
              >
                Refresh
              </Button>
              
              <Box sx={{ 
                display: 'flex',
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <Button size="small" sx={{ bgcolor: theme.palette.warning.dark }}>
                  PAPER
                </Button>
                <Button size="small">
                  LIVE
                </Button>
              </Box>
              
              <IconButton size="small">
                <NotificationsIcon fontSize="small" />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        
        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({...notification, open: false})}
          message={notification.message}
        />

        {/* Market Ticker */}
        <MarketTicker />
        
        {/* Main Dashboard Grid */}
        <Grid container spacing={3}>
          {/* Left Column - 2/3 width */}
          <Grid item xs={12} lg={8}>
            <OpenPositions />
            <PerformanceChart />
            <AIInsights />
          </Grid>
          
          {/* Right Column - 1/3 width */}
          <Grid item xs={12} lg={4}>
            <AccountSummary />
            <TradingStats />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TradeSyncDashboard;
