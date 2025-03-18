import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PerformanceChart = ({ chartData }) => {
  const [timeRange, setTimeRange] = useState('1W');
  
  if (!chartData) {
    return (
      <div className="card performance-chart">
        <div className="card-header">
          <h2 className="card-title">Performance</h2>
        </div>
        <div className="loading-placeholder">Loading chart data...</div>
      </div>
    );
  }
  
  const timeRanges = [
    { id: '1D', label: '1D' },
    { id: '1W', label: '1W' },
    { id: '1M', label: '1M' },
    { id: '3M', label: '3M' },
    { id: 'YTD', label: 'YTD' },
    { id: '1Y', label: '1Y' },
  ];
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e6edf3',
          font: {
            size: 12,
          },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: '#161b22',
        borderColor: '#30363d',
        borderWidth: 1,
        titleColor: '#e6edf3',
        bodyColor: '#e6edf3',
        padding: 10,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#8b949e',
          font: {
            size: 10
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(48, 54, 61, 0.5)',
          drawBorder: false,
        },
        ticks: {
          color: '#8b949e',
          font: {
            size: 10
          },
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 5,
      },
      line: {
        tension: 0.4,
      }
    }
  };

  return (
    <div className="card performance-chart">
      <div className="card-header">
        <h2 className="card-title">Performance</h2>
        <div className="time-range-selector">
          {timeRanges.map(range => (
            <button
              key={range.id}
              className={`btn btn-sm ${timeRange === range.id ? 'btn-primary' : ''}`}
              onClick={() => setTimeRange(range.id)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="chart-container" style={{ height: '300px', padding: '10px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default PerformanceChart;
