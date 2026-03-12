import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  Timeline,
  AccessTime,
  EmojiEvents,
  TrendingUp,
  Star,
  PlayCircle
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { useProgress } from '../../context/ProgressContext';
import { formatDate, formatTime } from '../../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const WatchTimeStats = ({ weekly = false }) => {
  const { watchTimeStats, loading, refreshStats } = useProgress();
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    refreshStats();
  }, []);

  useEffect(() => {
    if (watchTimeStats) {
      prepareChartData();
    }
  }, [watchTimeStats]);

  const prepareChartData = () => {
    if (!watchTimeStats?.dailyWatchTime) return;

    const dates = watchTimeStats.dailyWatchTime.map(d => formatDate(d.date, 'EEE'));
    const minutes = watchTimeStats.dailyWatchTime.map(d => d.minutes);

    setChartData({
      labels: dates,
      datasets: [
        {
          label: 'Watch Time (minutes)',
          data: minutes,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    });
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y} minutes`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Minutes'
        }
      }
    }
  };

  const subjectProgressData = {
    labels: ['Math', 'English', 'Science', 'Hindi', 'EVS'],
    datasets: [
      {
        data: [65, 45, 80, 30, 55],
        backgroundColor: [
          '#FF6B6B',
          '#4ECDC4',
          '#45B7D1',
          '#96CEB4',
          '#FFEAA7'
        ],
        borderWidth: 0
      }
    ]
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontFamily: '"Comic Neue", cursive',
              fontWeight: 'bold',
              color: 'primary.main'
            }}
          >
            Your Learning Progress 📊
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Card sx={{ borderRadius: 4, textAlign: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                  <AccessTime />
                </Avatar>
                <Typography variant="h4" color="primary" gutterBottom>
                  {formatTime(watchTimeStats?.totalWatchTime || 0)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Watch Time
                </Typography>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Card sx={{ borderRadius: 4, textAlign: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                  <EmojiEvents />
                </Avatar>
                <Typography variant="h4" color="success.main" gutterBottom>
                  15
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Achievements Earned
                </Typography>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Card sx={{ borderRadius: 4, textAlign: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant="h4" color="warning.main" gutterBottom>
                  75%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Average Score
                </Typography>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Card sx={{ borderRadius: 4, textAlign: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                  <Star />
                </Avatar>
                <Typography variant="h4" color="info.main" gutterBottom>
                  250
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Points Earned
                </Typography>
              </Card>
            </motion.div>
          </Grid>

          {/* Watch Time Chart */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" gutterBottom>
                Weekly Watch Time
              </Typography>
              <Box sx={{ height: 300 }}>
                {chartData && <Line data={chartData} options={chartOptions} />}
              </Box>
            </Paper>
          </Grid>

          {/* Subject Progress */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" gutterBottom>
                Subject Progress
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Doughnut data={subjectProgressData} options={{ cutout: '70%' }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                {subjectProgressData.labels.map((label, index) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: 2,
                        bgcolor: subjectProgressData.datasets[0].backgroundColor[index],
                        mr: 1
                      }}
                    />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {subjectProgressData.datasets[0].data[index]}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {[1, 2, 3, 4, 5].map((item) => (
                  <React.Fragment key={item}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          <PlayCircle />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`Watched: Introduction to Numbers - Part ${item}`}
                        secondary={`${item} hour${item > 1 ? 's' : ''} ago • Mathematics`}
                      />
                      <Chip
                        label="Completed"
                        size="small"
                        color="success"
                        sx={{ borderRadius: 2 }}
                      />
                    </ListItem>
                    {item < 5 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default WatchTimeStats;