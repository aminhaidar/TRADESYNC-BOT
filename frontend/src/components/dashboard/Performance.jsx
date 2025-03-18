import React, { useState } from 'react';
import { Button, ButtonSet } from '@carbon/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data - replace with your actual data
const sampleData = [
  { date: 'Jan', value: 10000 },
  { date: 'Feb', value: 12000 },
  { date: 'Mar', value: 11000 },
  { date: 'Apr', value: 14000 },
  { date: 'May', value: 13500 },
  { date: 'Jun', value: 15000 },
  { date: 'Jul', value: 17000 },
  { date: 'Aug', value: 16500 },
  { date: 'Sep', value: 19000 },
  { date: 'Oct', value: 18000 },
  { date: 'Nov', value: 21000 },
  { date: 'Dec', value: 24000 },
];

const Performance = ({ performanceData = sampleData }) => {
  const [timeframe, setTimeframe] = useState('1D');
  
  // Calculate percentage change from first to last data point
  const firstValue = performanceData[0]?.value || 0;
  const lastValue = performanceData[performanceData.length - 1]?.value || 0;
  const percentChange = firstValue ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  const isPositive = percentChange >= 0;

  return (
    <div style={{
      background: '#262626',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h2 style={{ 
          fontSize: '1rem', 
          fontWeight: '600',
          color: '#f4f4f4'
        }}>
          Performance
        </h2>
        
        <ButtonSet>
          <Button 
            kind={timeframe === '1D' ? 'primary' : 'tertiary'} 
            size="sm"
            onClick={() => setTimeframe('1D')}
          >
            1D
          </Button>
          <Button 
            kind={timeframe === '1W' ? 'primary' : 'tertiary'} 
            size="sm"
            onClick={() => setTimeframe('1W')}
          >
            1W
          </Button>
          <Button 
            kind={timeframe === '1M' ? 'primary' : 'tertiary'} 
            size="sm"
            onClick={() => setTimeframe('1M')}
          >
            1M
          </Button>
          <Button 
            kind={timeframe === '3M' ? 'primary' : 'tertiary'} 
            size="sm"
            onClick={() => setTimeframe('3M')}
          >
            3M
          </Button>
          <Button 
            kind={timeframe === '1Y' ? 'primary' : 'tertiary'} 
            size="sm"
            onClick={() => setTimeframe('1Y')}
          >
            1Y
          </Button>
        </ButtonSet>
      </div>
      
      <div style={{
        position: 'relative',
        height: '200px',
        marginBottom: '1rem'
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={performanceData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8D8D8D' }}
            />
            <YAxis 
              hide 
              domain={['dataMin - 1000', 'dataMax + 1000']} 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#333',
                borderColor: '#444',
                color: '#f4f4f4'
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Value']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={isPositive ? '#3FB950' : '#F85149'} 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: isPositive ? 'rgba(63, 185, 80, 0.1)' : 'rgba(248, 81, 73, 0.1)',
          color: isPositive ? '#3FB950' : '#F85149',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.875rem',
          fontWeight: '600'
        }}>
          {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
        </div>
      </div>
    </div>
  );
};

export default Performance;
