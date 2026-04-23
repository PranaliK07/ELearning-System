import React from 'react';
import { Box, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
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
import { Line } from 'react-chartjs-2';

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

const TimeSpentChart = ({ data, labels, height = 300 }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const lineColor = theme.palette.primary.main;
  const chartData = {
    labels: labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Watch Time (minutes)',
        data: data || [30, 45, 25, 60, 35, 50, 40],
        borderColor: lineColor,
        backgroundColor: alpha(lineColor, isDarkMode ? 0.28 : 0.18),
        tension: 0.4,
        fill: true,
        pointBackgroundColor: lineColor,
        pointBorderColor: theme.palette.background.paper,
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        callbacks: {
          label: (context) => `${context.parsed.y} minutes`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: alpha(theme.palette.divider, isDarkMode ? 0.7 : 0.55)
        },
        title: {
          display: true,
          text: 'Minutes',
          color: theme.palette.text.secondary
        },
        ticks: {
          color: theme.palette.text.secondary
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: theme.palette.text.secondary
        }
      }
    }
  };

  return (
    <Box sx={{ height, width: '100%' }}>
      <Line data={chartData} options={options} />
    </Box>
  );
};

export default TimeSpentChart;
