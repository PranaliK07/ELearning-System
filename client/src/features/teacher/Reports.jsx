import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  ButtonGroup,
} from '@mui/material';
import {
  GetApp,
  People,
  Assignment,
  EmojiEvents,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import axios from '../../utils/axios.js';
import { toast } from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const Reports = () => {
  const [period, setPeriod] = useState('daily');
  const [reportData, setReportData] = useState({
    summary: {},
    studentProgress: [],
    weeklyActivity: [],
    performanceMetrics: {
      avgScore: 0,
      completionRate: '0%',
      totalHours: 0,
    },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      let response;
      const endpoints = [
        `/api/reports?period=${period}`,
        '/api/reports',
        `/api/reports/${period}`
      ];

      let lastError;
      for (const endpoint of endpoints) {
        try {
          response = await axios.get(endpoint);
          break;
        } catch (err) {
          lastError = err;
          if (err?.response?.status !== 404) {
            throw err;
          }
        }
      }

      if (!response) {
        throw lastError || new Error('No report endpoint is available');
      }

      setReportData({
        summary: response.data?.summary || {},
        studentProgress: response.data?.studentProgress || [],
        weeklyActivity: response.data?.weeklyActivity || [],
        performanceMetrics: response.data?.performanceMetrics || {
          avgScore: 0,
          completionRate: '0%',
          totalHours: 0,
        },
      });
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      toast.error(apiMessage || 'Failed to load report data');
      setReportData({
        summary: {},
        studentProgress: [],
        weeklyActivity: [],
        performanceMetrics: {
          avgScore: 0,
          completionRate: '0%',
          totalHours: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const summaryMap = {
    daily: [
      { label: 'Active Students Today', value: reportData.summary.activeStudentsToday ?? 0 },
      { label: 'Videos Watched Today', value: reportData.summary.videosWatchedToday ?? 0 },
      { label: 'Topics Completed Today', value: reportData.summary.topicsCompletedToday ?? 0 },
      { label: 'New Enrollments Today', value: reportData.summary.newEnrollmentsToday ?? 0 },
    ],
    weekly: [
      { label: 'Total Active Users (Week)', value: reportData.summary.totalActiveUsersThisWeek ?? 0 },
      { label: 'Total Videos Watched', value: reportData.summary.totalVideosWatched ?? 0 },
      { label: 'Average Progress / Student', value: `${reportData.summary.averageProgressPerStudent ?? 0}%` },
      { label: 'Most Active Subject', value: reportData.summary.mostActiveSubject || 'N/A' },
    ],
    monthly: [
      { label: 'Total Users', value: reportData.summary.totalUsers ?? 0 },
      { label: 'Total Completed Topics', value: reportData.summary.totalCompletedTopics ?? 0 },
      { label: 'Total Videos Watched', value: reportData.summary.totalVideosWatched ?? 0 },
      { label: 'Top Performing Students', value: reportData.summary.topPerformingStudents?.length ?? 0 },
      { label: 'Overall Progress', value: `${reportData.summary.overallProgressPercentage ?? 0}%` },
    ],
  };

  const selectedSummary = summaryMap[period] || [];

  const barData = {
    labels: reportData.studentProgress.map(s => s.name),
    datasets: [
      {
        label: 'Quiz Scores',
        data: reportData.studentProgress.map(s => s.score),
        backgroundColor: 'rgba(63, 81, 181, 0.6)',
        borderColor: 'rgba(63, 81, 181, 1)',
        borderWidth: 1,
      },
      {
        label: 'Overall Progress',
        data: reportData.studentProgress.map(s => s.progress),
        backgroundColor: 'rgba(245, 0, 87, 0.6)',
        borderColor: 'rgba(245, 0, 87, 1)',
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: reportData.weeklyActivity.map(d => d.day),
    datasets: [
      {
        label: 'Active Students',
        data: reportData.weeklyActivity.map(d => d.active),
        fill: true,
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderColor: 'rgba(76, 175, 80, 1)',
        tension: 0.4,
      },
    ],
  };

  const exportCSV = () => {
    const headers = ['Student Name', 'Score', 'Progress'];
    const rows = reportData.studentProgress.map(s => [s.name, s.score, s.progress]);
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_report.csv");
    document.body.appendChild(link);
    link.click();
    toast.success('Report exported successfully');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Learning Analytics Reports
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Insights and performance tracking for your classes
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
          <ButtonGroup variant="outlined" size="small">
            <Button variant={period === 'daily' ? 'contained' : 'outlined'} onClick={() => setPeriod('daily')} disabled={loading}>
              Daily
            </Button>
            <Button variant={period === 'weekly' ? 'contained' : 'outlined'} onClick={() => setPeriod('weekly')} disabled={loading}>
              Weekly
            </Button>
            <Button variant={period === 'monthly' ? 'contained' : 'outlined'} onClick={() => setPeriod('monthly')} disabled={loading}>
              Monthly
            </Button>
          </ButtonGroup>
          <Button variant="outlined" startIcon={<GetApp />} onClick={exportCSV}>
            Export CSV
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EmojiEvents fontSize="large" />
                <Box>
                  <Typography variant="subtitle2">{selectedSummary[0]?.label || 'Metric 1'}</Typography>
                  <Typography variant="h4">{selectedSummary[0]?.value ?? 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Assignment fontSize="large" />
                <Box>
                  <Typography variant="subtitle2">{selectedSummary[1]?.label || 'Metric 2'}</Typography>
                  <Typography variant="h4">{selectedSummary[1]?.value ?? 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <People fontSize="large" />
                <Box>
                  <Typography variant="subtitle2">{selectedSummary[2]?.label || 'Metric 3'}</Typography>
                  <Typography variant="h4">{selectedSummary[2]?.value ?? 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Typography variant="body2" color="textSecondary">
          {selectedSummary.slice(3).map((item) => `${item.label}: ${item.value}`).join(' | ') || `Average Score: ${reportData.performanceMetrics.avgScore}% | Completion Rate: ${reportData.performanceMetrics.completionRate} | Total Learning Hours: ${reportData.performanceMetrics.totalHours}h`}
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>Student Performance</Typography>
            <Box sx={{ height: 300 }}>
              <Bar data={barData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>{period === 'monthly' ? 'Monthly Student Activity' : period === 'daily' ? 'Daily Student Activity' : 'Weekly Student Activity'}</Typography>
            <Box sx={{ height: 300 }}>
              <Line data={lineData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 4, borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell align="center">Quiz Performance</TableCell>
                <TableCell align="center">Lessons Completed</TableCell>
                <TableCell align="center">Last Active</TableCell>
                <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.studentProgress.map((row) => (
                <TableRow key={row.name}>
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="center">{row.score}%</TableCell>
                  <TableCell align="center">{row.progress}%</TableCell>
                  <TableCell align="center">{row.lastActive ? new Date(row.lastActive).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell align="right">
                    <Typography color={row.score > 80 ? 'success.main' : 'warning.main'} fontWeight="bold">
                      {row.score > 80 ? 'Excellent' : 'On Track'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default Reports;
