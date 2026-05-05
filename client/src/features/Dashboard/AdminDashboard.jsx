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
  useTheme,
  alpha,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  CheckCircle,
  People,
  Refresh,
  ReportProblem,
  School,
  Source,
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
    { label: 'Total Users', value: stats.totalUsers, icon: <People />, color: '#006D5B' },
    { label: 'Active Users', value: stats.activeUsers, icon: <CheckCircle />, color: '#008C75' },
    { label: 'Students', value: stats.totalStudents, icon: <School />, color: '#004D40' },
    { label: 'Teachers', value: stats.totalTeachers, icon: <People />, color: '#006D5B' },
    { label: 'Total Learning Assets', value: stats.totalContent, icon: <Source />, color: '#008C75' },
    { label: 'Open Reports', value: stats.openReports, icon: <ReportProblem />, color: '#004D40' },
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
            variant="contained"
            startIcon={refreshing ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{ borderRadius: '12px', px: 3 }}
          >
            Refresh Data
          </Button>
        </Box>

        {loading && <LinearProgress sx={{ mb: 4, borderRadius: 2 }} />}

        {/* SECTION 1: SYSTEM COMMAND CENTER */}
        <Paper sx={{ 
          p: { xs: 2.5, sm: 4 }, 
          mb: 5, 
          borderRadius: 6, 
          bgcolor: alpha('#006D5B', 0.03),
          border: '1px solid rgba(0, 109, 91, 0.1)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="900" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              Platform Command Center <Box component="span" sx={{ fontSize: '1.2rem' }}>⚡</Box>
            </Typography>
            <Typography variant="body2" color="textSecondary">Real-time metrics and system health overview.</Typography>
          </Box>

          <Grid container spacing={2.5}>
            {statCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={4} key={card.label}>
                <motion.div
                  whileHover={{ y: -5, scale: 1.01 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                    <Card sx={{ 
                      borderRadius: 4,
                      border: `2px solid ${alpha(card.color, 0.55)}`, // Vivid themed border
                      borderTop: `6px solid ${card.color}`,
                      bgcolor: '#ffffff',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                      height: '100%',
                      transition: 'all 0.3s ease-in-out'
                    }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          bgcolor: alpha(card.color, 0.1),
                          color: card.color,
                          flexShrink: 0
                        }}>
                          {React.cloneElement(card.icon, { sx: { fontSize: 24 } })}
                        </Box>
                        
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, display: 'block' }}>
                            {card.label}
                          </Typography>
                          <Typography variant="h5" fontWeight="900" sx={{ color: 'text.primary' }}>
                            {card.value}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* SECTION 2: PLATFORM ANALYTICS & INSIGHTS */}
        <Paper sx={{ 
          p: { xs: 2.5, sm: 4 }, 
          mb: 5, 
          borderRadius: 6, 
          bgcolor: alpha('#008C75', 0.02),
          border: '1px solid rgba(0, 140, 117, 0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
        }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="900" sx={{ color: '#008C75', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              Platform Analytics & Insights <Box component="span" sx={{ fontSize: '1.2rem' }}>📊</Box>
            </Typography>
            <Typography variant="body2" color="textSecondary">Deep dive into user distribution and content health.</Typography>
          </Box>

          <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 4, 
              border: '2px solid rgba(0, 109, 91, 0.45)', // Vivid themed border
              borderTop: '4px solid #006D5B', 
              bgcolor: '#ffffff',
              display: 'flex', 
              flexDirection: 'column', 
              boxShadow: 'none' 
            }}>
              <CardContent sx={{ p: 3, flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  User Distribution
                </Typography>
                <Stack spacing={2} sx={{ mt: 1 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="textSecondary">Students</Typography>
                      <Typography variant="body2" fontWeight="bold">{studentPercentage}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={studentPercentage} sx={{ height: 8, borderRadius: 999 }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="textSecondary">Teachers</Typography>
                      <Typography variant="body2" fontWeight="bold">{teacherPercentage}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={teacherPercentage} color="warning" sx={{ height: 8, borderRadius: 999 }} />
                  </Box>
                  <Box sx={{ pt: 1 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                      Inactive accounts
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">{inactiveUsers}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 4, 
              border: '2px solid rgba(0, 140, 117, 0.45)', // Vivid Emerald themed border
              borderTop: '4px solid #008C75', 
              bgcolor: '#ffffff', 
              display: 'flex', 
              flexDirection: 'column', 
              boxShadow: 'none' 
            }}>
              <CardContent sx={{ p: 3, flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Content Summary
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Videos</Typography>
                    <Typography variant="h5" fontWeight="bold">{contentBreakdown.videos}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Quizzes</Typography>
                    <Typography variant="h5" fontWeight="bold">{contentBreakdown.quizzes}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Assignments</Typography>
                    <Typography variant="h5" fontWeight="bold">{contentBreakdown.assignments}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Published</Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">{contentBreakdown.published}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 4, 
              border: '2px solid rgba(0, 77, 64, 0.45)', // Vivid Forest themed border
              borderTop: '4px solid #004D40', 
              bgcolor: '#ffffff', 
              display: 'flex', 
              flexDirection: 'column', 
              boxShadow: 'none' 
            }}>
              <CardContent sx={{ p: 3, flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Recent Reports
                </Typography>
                {recentReports.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    No recent reports available.
                  </Typography>
                ) : (
                  <Stack divider={<Divider flexItem />} spacing={1.5} sx={{ mt: 1 }}>
                    {recentReports.map((report) => (
                      <Box key={report.id || report._id || `${report.title}-${report.createdAt}`}>
                        <Typography variant="subtitle2" fontWeight="600" noWrap>
                          {report.title || 'Untitled'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                          {report.user || report.reportedBy || 'Anonymous'} • {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'No date'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip size="small" label={report.type || 'general'} sx={{ fontSize: '0.65rem', height: 18 }} />
                          <Chip
                            size="small"
                            label={report.status || 'pending'}
                            color={report.status === 'resolved' ? 'success' : report.status === 'in-progress' ? 'warning' : 'error'}
                            sx={{ fontSize: '0.65rem', height: 18 }}
                          />
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

        {/* SECTION 3: OPERATIONAL ACTIVITY STREAM */}
        <Paper sx={{ 
          p: { xs: 2.5, sm: 4 }, 
          mb: 5, 
          borderRadius: 6, 
          bgcolor: alpha('#004D40', 0.02),
          border: '1px solid rgba(0, 77, 64, 0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
        }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="900" sx={{ color: '#004D40', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              Operational Activity Stream <Box component="span" sx={{ fontSize: '1.2rem' }}>🚀</Box>
            </Typography>
            <Typography variant="body2" color="textSecondary">Real-time monitoring of user activity and support doubts.</Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 4, 
              border: '2px solid rgba(0, 109, 91, 0.45)', // Vivid themed border
              borderTop: '4px solid #006D5B', 
              height: '100%', 
              boxShadow: 'none' 
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Platform Doubts <Box component="span" sx={{ fontSize: '1.1rem', opacity: 0.8 }}>❓</Box>
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Monitor and manage student-teacher communications.
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => navigate('/admin/doubts')} 
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  View All History
                </Button>
              </Box>
              <DoubtTable />
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 4, 
              border: '1.5px solid rgba(0, 109, 91, 0.2)', 
              borderTop: '4px solid #008C75', 
              bgcolor: '#ffffff', 
              display: 'flex', 
              flexDirection: 'column', 
              boxShadow: 'none' 
            }}>
              <CardContent sx={{ p: 3, flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Newest Users
                </Typography>
                {recentUsers.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    No users available.
                  </Typography>
                ) : (
                  <Stack divider={<Divider flexItem />} spacing={1.5} sx={{ mt: 1 }}>
                    {recentUsers.map((user) => (
                      <Box key={user.id || user._id || user.email}>
                        <Typography variant="subtitle2" fontWeight="700">{user.name || 'Unknown User'}</Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                          {user.email || 'No email'}
                        </Typography>
                        <Chip
                          size="small"
                          label={user.role || 'student'}
                          sx={{ 
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            textTransform: 'uppercase',
                            bgcolor: isAdminLikeRole(user.role) ? alpha('#ef4444', 0.1) : user.role === 'teacher' ? alpha('#f59e0b', 0.1) : alpha('#2563eb', 0.1),
                            color: isAdminLikeRole(user.role) ? '#ef4444' : user.role === 'teacher' ? '#f59e0b' : '#2563eb',
                            border: 'none',
                            height: 20
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
            </Grid>
        </Paper>
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
