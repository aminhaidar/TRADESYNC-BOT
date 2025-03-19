import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { useTheme } from '@mui/material/styles';

const PerformanceChart = ({ data, timeframe }) => {
  const theme = useTheme();
  
  // Generate demo data if none is provided
  const chartData = data || generateDemoData(timeframe);
  
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis 
          dataKey="date" 
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '0.75rem' }}
        />
        <YAxis 
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '0.75rem' }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip 
          formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
          labelFormatter={(label) => `Date: ${label}`}
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 4
          }}
        />
        <Legend />
        <ReferenceLine y={0} stroke={theme.palette.divider} />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={theme.palette.primary.main}
          strokeWidth={2}
          dot={{ r: 0 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
          name="Portfolio Value" 
        />
        <Line 
          type="monotone" 
          dataKey="pnl" 
          stroke={theme.palette.secondary.main}
          strokeWidth={2}
          dot={{ r: 0 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
          name="Profit/Loss" 
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Generate demo data for the chart
const generateDemoData = (timeframe) => {
  let days = 30;
  switch(timeframe) {
    case '1D': days = 1; break;
    case '1W': days = 7; break;
    case '1M': days = 30; break;
    case '3M': days = 90; break;
    case '1Y': days = 365; break;
    default: days = 30;
  }
  
  const data = [];
  let baseValue = 50000;
  let lastValue = baseValue;
  
  // For 1D, generate hourly data
  if (timeframe === '1D') {
    for (let i = 9; i <= 16; i++) {
      const hour = i > 12 ? `${i-12}:00 PM` : `${i}:00 AM`;
      const change = Math.random() * 500 - 250;
      lastValue += change;
      data.push({
        date: hour,
        value: lastValue,
        pnl: lastValue - baseValue
      });
    }
    return data;
  }
  
  // Generate daily data for other timeframes
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
    
    // Add some randomness to the data
    const change = Math.random() * 2000 - 1000;
    lastValue += change;
    
    data.push({
      date: formattedDate,
      value: lastValue,
      pnl: lastValue - baseValue
    });
  }
  
  return data;
};

export default PerformanceChart;
