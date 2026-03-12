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
  InputAdornment
} from '@mui/material';
import {
  People,
  School,
  Assignment,
  TrendingUp,
  Add,
  Search,
  MoreVert,
  Email,
  Download,
  BarChart
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    // Mock data - replace with actual API calls
    setStudents([
      { id: 1, name: 'John Doe', grade: 1, progress: 75, lastActive: 'Today', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', grade: 1, progress: 82, lastActive: 'Yesterday', email: 'jane@example.com' },
      { id: 3, name: 'Bob Johnson', grade: 2, progress: 45, lastActive: '2 days ago', email: 'bob@example.com' },
      { id: 4, name: 'Alice Brown', grade: 2, progress: 91, lastActive: 'Today', email: 'alice@example.com' },
      { id: 5, name: 'Charlie Wilson', grade: 3, progress: 68, lastActive: 'Yesterday', email: 'charlie@example.com' },
    ]);

    setClasses([
      { id: 1, name: 'Class 1 - Mathematics', students: 12, progress: 68, pending: 3 },
      { id: 2, name: 'Class 1 - Science', students: 12, progress: 72, pending: 2 },
      { id: 3, name: 'Class 2 - Mathematics', students: 15, progress: 58, pending: 5 },
      { id: 4, name: 'Class 2 - English', students: 15, progress: 81, pending: 1 },
    ]);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Students', value: '45', icon: <People />, color: '#3f51b5' },
    { label: 'Active Classes', value: '6', icon: <School />, color: '#f50057' },
    { label: 'Assignments', value: '24', icon: <Assignment />, color: '#4caf50' },
    { label: 'Avg Progress', value: '72%', icon: <TrendingUp />, color: '#ff9800' },
  ];

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.name}! 👨‍🏫
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your classes and track student progress
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card sx={{ bgcolor: stat.color, color: 'white', borderRadius: 3 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h6">{stat.label}</Typography>
                        <Typography variant="h3">{stat.value}</Typography>
                      </Box>
                      <Box sx={{ fontSize: 48, opacity: 0.8 }}>
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
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/content/create')}
                >
                  Create New Content
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Assignment />}
                  onClick={() => navigate('/assignments/create')}
                >
                  Create Assignment
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BarChart />}
                  onClick={() => navigate('/reports')}
                >
                  View Reports
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => {/* Export data */}}
                >
                  Export Data
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Classes Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Classes
              </Typography>
              <Grid container spacing={2}>
                {classes.map((cls, index) => (
                  <Grid item xs={12} sm={6} md={3} key={cls.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 6 }
                      }}
                      onClick={() => navigate(`/class/${cls.id}`)}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {cls.name}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            Students: {cls.students}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Pending: {cls.pending}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={cls.progress} 
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                          {cls.progress}% Complete
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Students Table */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Students Overview
                </Typography>
                <TextField
                  size="small"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    )
                  }}
                  sx={{ width: 250 }}
                />
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Class</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Last Active</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                              {student.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">{student.name}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {student.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>Class {student.grade}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: 120 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={student.progress} 
                              sx={{ flex: 1, mr: 1, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption">
                              {student.progress}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{student.lastActive}</TableCell>
                        <TableCell>
                          <Chip 
                            label={student.progress > 70 ? 'Active' : 'Needs Attention'} 
                            size="small"
                            color={student.progress > 70 ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => navigate(`/student/${student.id}`)}>
                            <BarChart />
                          </IconButton>
                          <IconButton size="small" onClick={() => window.location.href = `mailto:${student.email}`}>
                            <Email />
                          </IconButton>
                          <IconButton size="small">
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
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