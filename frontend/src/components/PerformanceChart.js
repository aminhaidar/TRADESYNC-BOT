import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import '../styles/PerformanceChart.css';

export const PerformanceChart = ({ chartData }) => {
  console.log('PerformanceChart.js: Rendering PerformanceChart component, chartData=', chartData);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (chartRef.current && chartData) {
      const ctx = chartRef.current.getContext('2d');

      if (chartInstanceRef.current) {
        console.log('PerformanceChart.js: Destroying existing chart instance');
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: chartData.datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: 'var(--text-primary)',
                font: {
                  size: 12,
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                color: 'var(--text-secondary)',
              },
              grid: {
                display: false,
              },
            },
            y: {
              ticks: {
                color: 'var(--text-secondary)',
                callback: value => `$${value}`,
              },
              grid: {
                color: 'var(--border-color)',
              },
            },
          },
        },
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [chartData]);

  return (
    <div className="performance-chart-card">
      <div className="card-header">
        <h2 className="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3V21H21V3H3ZM19 19H5V5H19V19ZM7 7H17V9H7V7ZM7 11H14V13H7V11ZM7 15H17V17H7V15Z" fill="var(--accent-purple)"/>
          </svg>
          Performance Overview
        </h2>
      </div>
      <div className="chart-container">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};
