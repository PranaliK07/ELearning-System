import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  LinearProgress,
  Avatar,
  TextField,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  People,
  School,
  Assignment as AssignmentIcon,
  TrendingUp,
  Add,
  Search,
  MoreVert,
  Email,
  Download,
  BarChart,
  Person
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios.js';
import { toast } from 'react-hot-toast';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState({
    students: [],
    classes: [],
    stats: {
      totalStudents: 0,
      activeClasses: 0,
      assignments: 0,
      avgProgress: 0,
    },
    recentSubmissions: [],  
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/dashboard/teacher');
      setData({
        students: response.data.students || [],
        classes: response.data.classes || [],
        stats: response.data.stats || {
          totalStudents: 0,
          activeClasses: 0,
          assignments: 0,
          avgProgress: 0,
        },
        recentSubmissions: response.data.recentSubmissions || [],
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const headers = ['Name', 'Email', 'Grade', 'Last Active'];
    const rows = data.students.map(s => [s.name, s.email, s.Grade?.name || 'N/A', new Date(s.updatedAt).toLocaleDateString()]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "teacher_data.csv");
    document.body.appendChild(link);
    link.click();
    toast.success('Data exported successfully');
  };

  const filteredStudents = data.students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsConfig = [
    { label: 'Total Students', value: data.stats.totalStudents, icon: <People />, color: '#3f51b5' },
    { label: 'Active Classes', value: data.stats.activeClasses, icon: <School />, color: '#f50057' },
    { label: 'Assignments', value: data.stats.assignments, icon: <AssignmentIcon />, color: '#4caf50' },
    { label: 'Avg Progress', value: `${data.stats.avgProgress}%`, icon: <TrendingUp />, color: '#ff9800' },
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }} align="center">Loading teacher dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome back, {user?.name}! 👨‍🏫
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Here's an overview of your classes and student progress
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Person />}
            onClick={() => navigate('/profile')}
            sx={{ borderRadius: 2 }}
          >
            My Profile
          </Button>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsConfig.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card sx={{ bgcolor: stat.color, color: 'white', borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>{stat.label}</Typography>
                        <Typography variant="h4" fontWeight="bold">{stat.value}</Typography>
                      </Box>
                      <Box sx={{ fontSize: 40, opacity: 0.7 }}>
                        {stat.icon}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 4, boxShadow: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Management
          </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/content/create')}
                >
                  New Lesson
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => navigate('/topics/manage')}
                >
                  Add Topic
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<AssignmentIcon />}
                  onClick={() => navigate('/assignments/create')}
                >
                Add Assignment
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="info"
                startIcon={<BarChart />}
                onClick={() => navigate('/reports')}
              >
                View Analytics
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="success"
                startIcon={<Download />}
                onClick={exportData}
              >
                Export Data
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {/* Recent Submissions */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%', boxShadow: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Submissions
              </Typography>
              {data.recentSubmissions.length > 0 ? (
                <Box>
                  {data.recentSubmissions.map((sub) => (
                    <Box key={sub.id} sx={{ mb: 2, p: 1, borderBottom: '1px solid #eee' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar src={sub.student?.avatar} sx={{ width: 32, height: 32, mr: 1 }} />
                        <Typography variant="subtitle2">{sub.student?.name}</Typography>
                      </Box>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Submitted: {sub.Assignment?.title}
                      </Typography>
                      <Typography variant="caption" color="primary">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <AssignmentIcon sx={{ fontSize: 48, color: 'divider' }} />
                  <Typography color="textSecondary">No recent submissions</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Students Table */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Students Overview
                </Typography>
                <TextField
                  size="small"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    )
                  }}
                  sx={{ width: 200 }}
                />
              </Box>

              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Last Active</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }} src={student.avatar}>
                              {student.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">{student.name}</Typography>
                              <Typography variant="caption" color="textSecondary">{student.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{student.Grade?.name || 'Unassigned'}</TableCell>
                        <TableCell>{new Date(student.updatedAt).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Report">
                            <IconButton size="small" onClick={() => navigate('/reports')}>
                              <BarChart fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Send Email">
                            <IconButton size="small" onClick={() => window.location.href = `mailto:${student.email}`}>
                              <Email fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          No students found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default TeacherDashboard;
