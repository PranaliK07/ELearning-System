import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ProgressChart = ({ type = 'bar', data, options, height = 300 }) => {
  const theme = useTheme();
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme.palette.text.secondary,
        },
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
      }
    },
  };

  const renderChart = () => {
    switch(type) {
      case 'bar':
        return <Bar data={data} options={{ ...defaultOptions, ...options }} />;
      case 'doughnut':
        return <Doughnut data={data} options={{ ...defaultOptions, ...options }} />;
      default:
        return <Bar data={data} options={{ ...defaultOptions, ...options }} />;
    }
  };

  if (!data) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
        <Typography color="text.secondary">No data available</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ height, width: '100%' }}>
      {renderChart()}
    </Box>
  );
};

export default ProgressChart;
