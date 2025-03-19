import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardHeader, CardContent, 
  Button, Drawer, AppBar, Toolbar, Avatar, Divider, IconButton,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Tabs, Tab, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Alert, CircularProgress, Snackbar, alpha,
  useTheme, useMediaQuery, Collapse, Menu, MenuItem, CssBaseline
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const drawerWidth = 240;
const headerHeight = 64;

const TradeSyncDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });
  const [openTradeDialog, setOpenTradeDialog] = useState(false);
  const [expandedPosition, setExpandedPosition] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  
  // Toggle position expansion
  const togglePosition = (id) => {
    setExpandedPosition(expandedPosition === id ? null : id);
  };
  
  // Handle position scaling
  const handleScale = (positionId, percentage, event) => {
    event.stopPropagation();
    console.log(`Scaling position ${positionId} by ${percentage}%`);
    
    setNotification({
      open: true,
      message: `Scaled ${positionId.toUpperCase()} position by ${percentage}%`,
      type: 'success'
    });
  };
  
  // User menu handlers
  const handleOpenUserMenu = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };
  
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
      costBasis: 2118.00,
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
      costBasis: 2707.50,
      plValue: -40.20, 
      plPercent: -1.5
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
      plPercent: 13.5
    }
  ];
  
  // Mobile responsiveness handler
  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: 1.5,
            borderRadius: 1,
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
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

  // Drawer content
  const drawerContent = (
    <>
      <Box sx={{ p: 3 }}>
        {/* Connection Status */}
        <Box 
          sx={{ 
            mb: 2,
            p: 1.5, 
            borderRadius: 2,
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.1),
            bgcolor: alpha(theme.palette.background.paper, 0.2),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <Box 
              sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: theme.palette.success.main,
                boxShadow: '0 0 6px rgba(16, 185, 129, 0.4)',
                mr: 1
              }} 
            />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              Connected
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex',
            borderRadius: 1,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.1)
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
                fontWeight: 600,
                flex: 1
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
                height: 32,
                flex: 1
              }}
            >
              LIVE
            </Button>
          </Box>
        </Box>
      </Box>
      <Divider sx={{ opacity: 0.1 }} />
      
      <List sx={{ py: 1.5, px: 1.5 }}>
        <ListItem disablePadding>
          <ListItemButton 
            selected
            sx={{ 
              borderRadius: '8px',
              my: 0.5, 
              px: 2,
              '&.Mui-selected': {
                bgcolor: alpha(theme.palette.primary.main, 0.15)
              }
            }}
          >
            <ListItemIcon><DashboardIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            sx={{ 
              borderRadius: '8px',
              my: 0.5,
              px: 2
            }}
          >
            <ListItemIcon><LightbulbIcon /></ListItemIcon>
            <ListItemText primary="AI Insights" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            sx={{ 
              borderRadius: '8px',
              my: 0.5,
              px: 2
            }}
          >
            <ListItemIcon><AccountBalanceIcon /></ListItemIcon>
            <ListItemText primary="Portfolio" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            sx={{ 
              borderRadius: '8px',
              my: 0.5,
              px: 2
            }}
          >
            <ListItemIcon><TrendingUpIcon /></ListItemIcon>
            <ListItemText primary="Performance" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            sx={{ 
              borderRadius: '8px',
              my: 0.5,
              px: 2
            }}
          >
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
          <Card 
            sx={{ 
              height: '100%', 
              position: 'relative', 
              borderRadius: 2,
              overflow: 'hidden',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)'
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
  );

  // Performance chart component
  const PerformanceChart = () => (
    <Card sx={{ mb: 3, borderRadius: 2 }}>
      <CardHeader
        title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Portfolio Performance</Typography>}
        action={
          <Tabs 
            value={activeTab} 
            onChange={(e, v) => setActiveTab(v)}
            sx={{
              '& .MuiTab-root': { 
                minWidth: 50,
                minHeight: 36,
                px: 2,
                py: 1,
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
        sx={{ px: 3, pt: 2, pb: 0 }}
      />
      <CardContent sx={{ p: 2, height: 300 }}>
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
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.2)} vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke={theme.palette.text.secondary}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              axisLine={{ stroke: theme.palette.divider }}
              tickLine={false}
            />
            <YAxis 
              stroke={theme.palette.text.secondary}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
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
                fill: theme.palette.primary.main
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
                fill: theme.palette.success.main
              }}
              name="Profit/Loss" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  // Open positions component - now with expandable functionality
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
            sx={{
              borderRadius: '20px',
              boxShadow: '0 4px 10px rgba(58, 142, 255, 0.3)'
            }}
          >
            New Trade
          </Button>
        }
        sx={{ px: 3, pt: 2.5, pb: 1 }}
      />
      <CardContent sx={{ p: 2 }}>
        {positions.map((position) => (
          <Card 
            key={position.id} 
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.2s',
              border: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.2),
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
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
                display: 'flex',
                flexDirection: 'column'
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
                    bgcolor: alpha(theme.palette.background.paper, 0.3),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                    }
                  }}
                >
                  {expandedPosition === position.id ? 
                    <ExpandLessIcon fontSize="small" /> : 
                    <ExpandMoreIcon fontSize="small" />
                  }
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
            
            {/* Expandable section */}
            <Collapse in={expandedPosition === position.id}>
              <Box 
                sx={{ 
                  px: 3, 
                  pb: 2, 
                  pt: 0,
                  bgcolor: alpha(theme.palette.background.paper, 0.3),
                  borderTop: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.1)
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
                  <Typography variant="caption" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                    Scale position:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {[15, 25, 50, 75, 100].map((percent) => (
                      <Button 
                        key={percent}
                        variant="outlined" 
                        size="small"
                        onClick={(e) => handleScale(position.id, percent, e)}
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
            </Collapse>
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
        sx={{ px: 3, pt: 2.5, pb: 1 }}
      />
      <CardContent sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress color="primary" size={40} thickness={4} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading insights...
            </Typography>
          </Box>
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
                {insights.map((insight) => (
                  <TableRow 
                    key={insight.id}
                    sx={{ 
                      backgroundColor: insight.category === "Actionable Trade" 
                        ? alpha(theme.palette.success.main, 0.05)
                        : alpha(theme.palette.primary.main, 0.05)
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
                        color={insight.category === "Actionable Trade" ? "success" : "primary"}
                        sx={{ 
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell>{insight.summary}</TableCell>
                    <TableCell>
                      <Chip 
                        label={insight.sentiment} 
                        size="small" 
                        color={insight.sentiment === "Bullish" ? "success" : 
                               insight.sentiment === "Bearish" ? "error" : "default"}
                        sx={{ 
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Typography variant="body2" sx={{ mr: 1, fontWeight: 600 }}>
                          {insight.confidence.toFixed(1)}%
                        </Typography>
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
  );

  // Account Summary component
  const AccountSummary = () => (
    <Card 
      sx={{ 
        mb: 3, 
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(58, 142, 255, 0.1) 0%, rgba(58, 142, 255, 0.05) 100%)',
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.dark, 0.15),
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: alpha(theme.palette.text.primary, 0.85) }}>
          Account Summary
        </Typography>
        <Typography 
          variant="h3" 
          sx={{ 
            mb: 2, 
            fontWeight: 700, 
            color: theme.palette.primary.main,
            textShadow: '0 0 20px rgba(58, 142, 255, 0.2)'
          }}
        >
          $52,490.40
        </Typography>
        
        <Paper 
          sx={{ 
            p: 2, 
            mb: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.6),
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
              sx={{ 
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.1)
              }}
            >
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
            <Paper 
              sx={{ 
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.1)
              }}
            >
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
    <Card 
      sx={{ 
        borderRadius: 2,
        position: 'relative',
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Trading Stats</Typography>
        
        <Paper 
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
                <ArrowDropUpIcon sx={{ color: theme.palette.success.main }} />
                <Typography variant="body1" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
                  14.2%
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper 
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
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          width: '100%',
          boxShadow: 'none',
          bgcolor: theme.palette.background.default,
          borderBottom: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.1),
          backdropFilter: 'blur(8px)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {/* Menu Toggle (Mobile) */}
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
          
          {/* Logo and App Name */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.primary.main, 
                width: 32, 
                height: 32,
                boxShadow: '0 0 10px rgba(58, 142, 255, 0.3)'
              }}
            >
              T
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>
              TradeSync
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              Dashboard
            </Typography>
          </Box>
          
          {/* Header Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Refresh Button */}
            <Button 
              variant="outlined" 
              color="inherit" 
              startIcon={<RefreshIcon />}
              size="small"
              sx={{ 
                borderRadius: '20px',
                textTransform: 'none'
              }}
            >
              Refresh
            </Button>
            
            {/* Notifications */}
            <IconButton 
              size="small" 
              sx={{ 
                ml: 1,
                position: 'relative'
              }}
            >
              <NotificationsIcon fontSize="small" />
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: theme.palette.error.main,
                  position: 'absolute',
                  top: 6,
                  right: 6
                }} 
              />
            </IconButton>
            
            {/* User Profile Menu */}
            <Button 
              onClick={handleOpenUserMenu}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                ml: 1,
                textTransform: 'none',
                color: theme.palette.text.primary,
                '&:hover': {
                  bgcolor: alpha(theme.palette.background.paper, 0.3)
                }
              }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.2) }}>JP</Avatar>
              <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>John Parker</Typography>
                <Typography variant="caption" color="text.secondary">Bot Builder</Typography>
              </Box>
              <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} />
            </Button>
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleCloseUserMenu}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 180,
                  borderRadius: 2,
                  bgcolor: theme.palette.background.paper,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.1),
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }
              }}
            >
              <MenuItem onClick={handleCloseUserMenu}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>My Profile</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleCloseUserMenu}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
              <Divider sx={{ my: 1, opacity: 0.1 }} />
              <MenuItem onClick={handleCloseUserMenu}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

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
            bgcolor: theme.palette.background.default,
            backgroundImage: 'linear-gradient(to bottom, rgba(10, 12, 16, 0.9), rgba(10, 12, 16, 0.95))',
            backdropFilter: 'blur(10px)',
            borderRight: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.1),
            pt: `${headerHeight}px`,
            overflowX: 'hidden'
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
          pt: `${headerHeight + 24}px`,
          pb: 3,
          px: 3,
          bgcolor: theme.palette.background.default,
          backgroundImage: 'radial-gradient(at 30% 20%, rgba(19, 24, 32, 0.4) 0px, transparent 70%), radial-gradient(at 70% 80%, rgba(25, 30, 40, 0.3) 0px, transparent 70%)',
          minHeight: '100vh'
        }}
      >
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
