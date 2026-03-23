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
} from '@mui/material';
import {
  BarChart,
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
  const [reportData, setReportData] = useState({
    studentProgress: [],
    weeklyActivity: [],
    performanceMetrics: {},
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      // In a real app, these would be dedicated reporting endpoints
      // For now, we'll simulate with what we have or mock
      const response = await axios.get('/api/dashboard/teacher');
      // Assuming the dashboard returns some stats, but we'll mock for the premium look
      setReportData({
        studentProgress: [
          { name: 'John Doe', score: 85, progress: 90 },
          { name: 'Jane Smith', score: 92, progress: 95 },
          { name: 'Bob Johnson', score: 78, progress: 80 },
          { name: 'Alice Brown', score: 95, progress: 100 },
          { name: 'Charlie Wilson', score: 88, progress: 85 },
        ],
        weeklyActivity: [
          { day: 'Mon', active: 32 },
          { day: 'Tue', active: 45 },
          { day: 'Wed', active: 28 },
          { day: 'Thu', active: 55 },
          { day: 'Fri', active: 40 },
          { day: 'Sat', active: 15 },
          { day: 'Sun', active: 10 },
        ],
        performanceMetrics: {
          avgScore: 87.6,
          completionRate: '82%',
          totalHours: 145,
        },
      });
    } catch (error) {
      toast.error('Failed to load report data');
    }
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Learning Analytics Reports
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Insights and performance tracking for your classes
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<GetApp />}
          onClick={exportCSV}
        >
          Export CSV
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EmojiEvents fontSize="large" />
                <Box>
                  <Typography variant="subtitle2">Average Score</Typography>
                  <Typography variant="h4">{reportData.performanceMetrics.avgScore}%</Typography>
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
                  <Typography variant="subtitle2">Completion Rate</Typography>
                  <Typography variant="h4">{reportData.performanceMetrics.completionRate}</Typography>
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
                  <Typography variant="subtitle2">Total Learning Hours</Typography>
                  <Typography variant="h4">{reportData.performanceMetrics.totalHours}h</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
            <Typography variant="h6" gutterBottom>Weekly Student Activity</Typography>
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
                  <TableCell align="center">Today</TableCell>
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
