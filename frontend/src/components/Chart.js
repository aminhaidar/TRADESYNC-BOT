import React, { useEffect } from 'react';
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
  Filler 
} from 'chart.js';

// Register Chart.js components and Filler plugin
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Chart = ({ data }) => {
  useEffect(() => {
    console.log('Chart data:', data);
    // Ensure datasets have fill property
    if (data && data.datasets) {
      data.datasets.forEach(dataset => {
        if (dataset.fill === undefined) {
          dataset.fill = true;
        }
      });
    }
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          color: '#e6edf3',
          font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#21262d',
        titleColor: '#e6edf3',
        bodyColor: '#e6edf3',
        borderColor: '#30363d',
        borderWidth: 1,
      },
      filler: {
        propagate: true
      }
    },
    scales: {
      x: { 
        title: { 
          display: true, 
          text: 'Date',
          color: '#8b949e'
        },
        grid: {
          color: '#30363d',
          borderColor: '#30363d'
        },
        ticks: {
          color: '#8b949e'
        }
      },
      y: { 
        title: { 
          display: true, 
          text: 'Value ($)',
          color: '#8b949e'
        },
        beginAtZero: false,
        grid: {
          color: '#30363d',
          borderColor: '#30363d'
        },
        ticks: {
          color: '#8b949e'
        }
      },
    },
  };

  return (
    <div style={{ height: '350px', width: '100%' }}>
      {data ? <Line data={data} options={options} /> : <div>No chart data available</div>}
    </div>
  );
};

export default Chart;
