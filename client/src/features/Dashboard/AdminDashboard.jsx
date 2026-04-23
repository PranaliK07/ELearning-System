import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  CheckCircle,
  EventAvailable,
  People,
  Refresh,
  ReportProblem,
  School,
  Source,
  WarningAmber,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { isAdminLikeRole } from '../../utils/roles';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [content, setContent] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [reports, setReports] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    date: null,
    totals: { present: 0, absent: 0, totalMarked: 0 },
    classes: []
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, contentRes, reportsRes, attendanceRes, quizzesRes] = await Promise.allSettled([
        api.get('/api/users'),
        api.get('/api/content'),
        api.get('/api/reports'),
        api.get('/api/attendance/summary'),
        api.get('/api/quiz'),
      ]);

      if (usersRes.status === 'fulfilled') {
        const usersData = Array.isArray(usersRes.value.data)
          ? usersRes.value.data
          : (usersRes.value.data?.users || []);
        setUsers(usersData);
      } else {
        setUsers([]);
      }

      if (contentRes.status === 'fulfilled') {
        const payload = contentRes.value.data;
        let contentData = [];

        if (Array.isArray(payload)) contentData = payload;
        else if (payload?.content) contentData = payload.content;
        else if (payload?.contents) contentData = payload.contents;
        else if (payload?.data) contentData = payload.data;
        else if (payload?.items) contentData = payload.items;
        
        setContent(contentData);
      } else {
        setContent([]);
      }

      if (quizzesRes.status === 'fulfilled') {
        const payload = quizzesRes.value.data;
        const quizData = Array.isArray(payload) ? payload : (payload?.quizzes || []);
        setQuizzes(quizData);
      } else {
        setQuizzes([]);
      }

      if (reportsRes.status === 'fulfilled') {
        const reportsData = Array.isArray(reportsRes.value.data)
          ? reportsRes.value.data
          : (reportsRes.value.data?.reports || []);
        setReports(reportsData);
      } else {
        setReports([]);
      }

      if (attendanceRes.status === 'fulfilled') {
        const payload = attendanceRes.value.data || {};
        setAttendanceSummary({
          date: payload.date || null,
          totals: payload.totals || { present: 0, absent: 0, totalMarked: 0 },
          classes: Array.isArray(payload.classes) ? payload.classes : []
        });
      } else {
        setAttendanceSummary({ date: null, totals: { present: 0, absent: 0, totalMarked: 0 }, classes: [] });
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAdminData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((user) => {
      const status = user.status || user.isActive || user.active;
      return status === 'active' || status === 'Active' || status === true;
    }).length,
    totalStudents: users.filter((user) => {
      const role = user.role || user.userRole;
      return role === 'student' || role === 'Student';
    }).length,
    totalTeachers: users.filter((user) => {
      const role = user.role || user.userRole;
      return role === 'teacher' || role === 'Teacher';
    }).length,
    totalContent: content.length + quizzes.length,
    openReports: reports.filter((report) => {
      const status = report.status || report.reportStatus;
      return status !== 'resolved' && status !== 'Resolved';
    }).length,
    attendanceMarkedToday: attendanceSummary?.totals?.totalMarked || 0,
    attendancePresentToday: attendanceSummary?.totals?.present || 0,
    attendanceAbsentToday: attendanceSummary?.totals?.absent || 0,
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: <People />, color: '#2563eb' },
    { label: 'Active Users', value: stats.activeUsers, icon: <CheckCircle />, color: '#16a34a' },
    { label: 'Students', value: stats.totalStudents, icon: <School />, color: '#f59e0b' },
    { label: 'Teachers', value: stats.totalTeachers, icon: <People />, color: '#ef4444' },
    { label: 'Total Learning Assets', value: stats.totalContent, icon: <Source />, color: '#7c3aed' },
    { label: 'Open Reports', value: stats.openReports, icon: <ReportProblem />, color: '#db2777' },
    { label: 'Attendance (Today)', value: stats.attendanceMarkedToday, icon: <EventAvailable />, color: '#0ea5e9' },
  ];

  const inactiveUsers = Math.max(stats.totalUsers - stats.activeUsers, 0);
  const contentBreakdown = {
    videos: content.filter((item) => item.type === 'video' || item.contentType === 'video').length,
    quizzes: quizzes.length,
    assignments: content.filter((item) => item.type === 'assignment' || item.contentType === 'assignment' || item.type === 'reading').length,
    published: content.filter((item) => item.status === 'published' || item.isPublished).length + quizzes.filter(q => q.isPublished).length,
  };

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0))
    .slice(0, 5);
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
    .slice(0, 5);
  const studentPercentage = stats.totalUsers ? Math.round((stats.totalStudents / stats.totalUsers) * 100) : 0;
  const teacherPercentage = stats.totalUsers ? Math.round((stats.totalTeachers / stats.totalUsers) * 100) : 0;

  return (
    <Container maxWidth="lg">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="textSecondary">
              A clean overview of users, content, reports, and platform health.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={20} /> : <Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh
          </Button>
        </Box>

        {loading && <LinearProgress sx={{ mb: 3 }} />}

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Grid container spacing={3} sx={{ maxWidth: { xs: '100%', sm: 600, md: 700 } }}>
            {statCards.map((card, index) => (
              <Grid item xs={12} key={card.label}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card sx={{ 
                    bgcolor: card.color, 
                    color: 'white', 
                    borderRadius: 8, // More rounded as seen in screenshot
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    minHeight: 110,
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <CardContent sx={{ width: '100%', p: '24px !important' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                            {card.label}
                          </Typography>
                          <Typography variant="h3" fontWeight="900" sx={{ mt: 0.5 }}>
                            {card.value}
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          bgcolor: 'rgba(255,255,255,0.25)',
                          p: 2,
                          borderRadius: '24px',
                          display: 'flex',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                          backdropFilter: 'blur(4px)'
                        }}>
                          {React.cloneElement(card.icon, { sx: { fontSize: 40 } })}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Platform Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        User Distribution
                      </Typography>
                      <Stack spacing={1.5}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">Students</Typography>
                            <Typography variant="body2">{studentPercentage}%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={studentPercentage} sx={{ height: 8, borderRadius: 999 }} />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">Teachers</Typography>
                            <Typography variant="body2">{teacherPercentage}%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={teacherPercentage} color="warning" sx={{ height: 8, borderRadius: 999 }} />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Inactive accounts
                          </Typography>
                          <Typography variant="h5">{inactiveUsers}</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Content Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">Videos</Typography>
                          <Typography variant="h5">{contentBreakdown.videos}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">Quizzes</Typography>
                          <Typography variant="h5">{contentBreakdown.quizzes}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">Assignments</Typography>
                          <Typography variant="h5">{contentBreakdown.assignments}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">Published</Typography>
                          <Typography variant="h5">{contentBreakdown.published}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Recent Reports
                      </Typography>
                      {recentReports.length === 0 ? (
                        <Typography variant="body2" color="textSecondary">
                          No recent reports available.
                        </Typography>
                      ) : (
                        <Stack divider={<Divider flexItem />} spacing={1}>
                          {recentReports.map((report) => (
                            <Box key={report.id || report._id || `${report.title}-${report.createdAt}`}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                                <Box>
                                  <Typography variant="subtitle2">
                                    {report.title || 'Untitled'}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    {report.user || report.reportedBy || 'Anonymous'} • {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'No date'}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Chip size="small" label={report.type || 'general'} />
                                  <Chip
                                    size="small"
                                    label={report.status || 'pending'}
                                    color={report.status === 'resolved' ? 'success' : report.status === 'in-progress' ? 'warning' : 'error'}
                                  />
                                </Box>
                              </Box>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Attention Needed
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <WarningAmber color="warning" />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Inactive users
                      </Typography>
                      <Typography variant="h6">{inactiveUsers}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ReportProblem color="error" />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Open reports
                      </Typography>
                      <Typography variant="h6">{stats.openReports}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Source color="secondary" />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Unpublished content
                      </Typography>
                      <Typography variant="h6">{Math.max(stats.totalContent - contentBreakdown.published, 0)}</Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Newest Users
                </Typography>
                {recentUsers.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">
                    No users available.
                  </Typography>
                ) : (
                  <Stack divider={<Divider flexItem />} spacing={1}>
                    {recentUsers.map((user) => (
                      <Box key={user.id || user._id || user.email}>
                        <Typography variant="subtitle2">{user.name || 'Unknown User'}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {user.email || 'No email'}
                        </Typography>
                        <Chip
                          size="small"
                          sx={{ mt: 1 }}
                          label={user.role || 'student'}
                          color={isAdminLikeRole(user.role) ? 'error' : user.role === 'teacher' ? 'warning' : 'primary'}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Platform Doubts ❓
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Monitor and manage student-teacher communications.
                  </Typography>
                </Box>
                <Button variant="contained" onClick={() => navigate('/admin/doubts')} sx={{ borderRadius: 2, flexShrink: 0 }}>
                  View All History
                </Button>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <DoubtTable />
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

const DoubtTable = () => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDoubtId, setSelectedDoubtId] = useState(null);

  const fetchDoubts = async () => {
    try {
      const res = await api.get('/api/doubts/all');
      setDoubts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  const handleDeleteClick = (id) => {
    setSelectedDoubtId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/doubts/${selectedDoubtId}`);
      setDoubts(prev => prev.filter(d => d.id !== selectedDoubtId));
      toast.success('Doubt deleted successfully');
    } catch (err) {
      toast.error('Failed to delete doubt');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedDoubtId(null);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <>
      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto', border: 'none', boxShadow: 'none' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Teacher</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Question</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {doubts.slice(0, 5).map(doubt => (
              <TableRow key={doubt.id} hover>
                <TableCell>{doubt.student?.name || 'N/A'}</TableCell>
                <TableCell>{doubt.teacher?.name || 'N/A'}</TableCell>
                <TableCell sx={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {doubt.question}
                </TableCell>
                <TableCell>
                  <Chip 
                    size="small" 
                    label={doubt.status} 
                    color={doubt.status === 'resolved' ? 'success' : 'warning'} 
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Button 
                    size="small" 
                    color="error" 
                    variant="outlined" 
                    onClick={() => handleDeleteClick(doubt.id)}
                    sx={{ borderRadius: '8px' }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {doubts.length === 0 && (
          <Typography sx={{ py: 4, textAlign: 'center' }} color="textSecondary">
            No doubts found on the platform.
          </Typography>
        )}
      </TableContainer>

      {/* Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: '16px', p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Delete Doubt History?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this doubt entry? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ borderRadius: '8px' }}>
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained" 
            sx={{ borderRadius: '8px' }}
            autoFocus
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminDashboard;
