import React from 'react';
import { Card, CardContent, Typography, Grid, Box, alpha, useTheme } from '@mui/material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const MarketTicker = ({ marketData }) => {
  const theme = useTheme();
  
  return (
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
  );
};

export default MarketTicker;
