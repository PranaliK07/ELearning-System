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
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Divider,
  Tooltip,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  People,
  School,
  Assessment,
  TrendingUp,
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Warning,
  BarChart,
  Settings
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';


const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [content, setContent] = useState([]);
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [serverAccessAvailable, setServerAccessAvailable] = useState(true);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student',
    grade: '',
    status: 'active'
  });
  const [roleAccess, setRoleAccess] = useState({
    admin: new Set(['dashboard', 'users', 'content', 'reports', 'analytics', 'settings', 'subjects', 'assignments', 'business-settings']),
    teacher: new Set(['dashboard', 'subjects', 'assignments', 'reports']),
    student: new Set(['dashboard', 'subjects', 'assignments'])
  });
  const loadSavedAccess = () => {
    try {
      const saved = localStorage.getItem('roleAccess');
      if (!saved) return;
      const parsed = JSON.parse(saved);
      setRoleAccess(Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, new Set(v)])));
    } catch (err) {
      console.warn('Failed to parse saved role access', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
    loadSavedAccess();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'business') {
      setTabValue(3);
    }
  }, [location.search]);

  const fetchAdminData = async () => {
    try {
      const usersRes = await api.get('/api/users');
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);

      const contentRes = await api.get('/api/content');
      setContent(Array.isArray(contentRes.data) ? contentRes.data : []);

      // We can also fetch dashboard stats if needed
      // const statsRes = await axios.get('/api/admin/stats');
      // setDashboardStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } 
  };

  useEffect(() => {
    const fetchAccess = async () => {
      if (!serverAccessAvailable) return;
      try {
        const res = await api.get('/api/admin/role-access');
        if (res.data) {
          setRoleAccess(Object.fromEntries(Object.entries(res.data).map(([k, v]) => [k, new Set(v)])));
        }
      } catch (err) {
        if (err?.response?.status === 404) {
          setServerAccessAvailable(false);
        }
        loadSavedAccess();
      }
    };
    fetchAccess();
  }, [serverAccessAvailable]);

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/api/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
    const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalStudents: users.filter(u => u.role === 'student').length,
    totalTeachers: users.filter(u => u.role === 'teacher').length,
    totalContent: content.length,
    totalReports: reports.filter(r => r.status !== 'resolved').length
  };

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard 👑
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage users, content, and monitor platform activity
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#3f51b5', color: 'white', borderRadius: 3 }}>
              <CardContent>
                <People sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4">{stats.totalUsers}</Typography>
                <Typography variant="body2">Total Users</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#4caf50', color: 'white', borderRadius: 3 }}>
              <CardContent>
                <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4">{stats.activeUsers}</Typography>
                <Typography variant="body2">Active Users</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#ff9800', color: 'white', borderRadius: 3 }}>
              <CardContent>
                <School sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4">{stats.totalStudents}</Typography>
                <Typography variant="body2">Students</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#f44336', color: 'white', borderRadius: 3 }}>
              <CardContent>
                <Assessment sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4">{stats.totalTeachers}</Typography>
                <Typography variant="body2">Teachers</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#9c27b0', color: 'white', borderRadius: 3 }}>
              <CardContent>
                <Warning sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4">{stats.totalReports}</Typography>
                <Typography variant="body2">Open Reports</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3, borderRadius: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label="Users Management" />
            <Tab label="Content Overview" />
            <Tab label="Reports & Issues" />
            <Tab label="Business Settings" />
            <Tab label="System Settings" />
          </Tabs>
        </Paper>

        {/* Users Management Tab */}
        {tabValue === 0 && (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                User Management
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Filter by Role</InputLabel>
                  <Select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    label="Filter by Role"
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="student">Students</MenuItem>
                    <MenuItem value="teacher">Teachers</MenuItem>
                    <MenuItem value="admin">Admins</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  placeholder="Search users..."
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
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenUserDialog(true)}
                >
                  Add User
                </Button>
              </Box>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                            {user.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{user.name}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          color={
                            user.role === 'admin' ? 'error' :
                              user.role === 'teacher' ? 'warning' : 'primary'
                          }
                        />
                      </TableCell>
                      <TableCell>{user.grade || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          size="small"
                          color={user.status === 'active' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => navigate(`/admin/users/${user.id}`)}>
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            if (window.confirm('Delete this user? This cannot be undone.')) {
                              handleDeleteUser(user.id);
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                        {user.status === 'active' ? (
                          <IconButton size="small" color="warning">
                            <Block />
                          </IconButton>
                        ) : (
                          <IconButton size="small" color="success">
                            <CheckCircle />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Content Overview Tab */}
        {tabValue === 1 && (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Content Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/content/create')}
              >
                Add Content
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Views/Attempts</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {content.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{item.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.type}
                          size="small"
                          color={
                            item.type === 'video' ? 'primary' :
                              item.type === 'quiz' ? 'warning' : 'secondary'
                          }
                        />
                      </TableCell>
                      <TableCell>Class {item.grade}</TableCell>
                      <TableCell>{item.subject}</TableCell>
                      <TableCell>{item.views || item.attempts || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          size="small"
                          color={item.status === 'published' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Reports Tab */}
        {tabValue === 2 && (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Reports & Issues
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Reported By</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id} hover>
                      <TableCell>
                        <Chip
                          label={report.type}
                          size="small"
                          color={
                            report.type === 'bug' ? 'error' :
                              report.type === 'feedback' ? 'info' : 'warning'
                          }
                        />
                      </TableCell>
                      <TableCell>{report.title}</TableCell>
                      <TableCell>{report.user}</TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>
                        <Chip
                          label={report.status}
                          size="small"
                          color={
                            report.status === 'resolved' ? 'success' :
                              report.status === 'in-progress' ? 'warning' : 'error'
                          }
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="primary">
                          <CheckCircle />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Add / Edit User Dialog */}
        <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>Add New User</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    label="Role"
                    value={newUser.role}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="teacher">Teacher</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Grade (if student)"
                  value={newUser.grade}
                  onChange={(e) => setNewUser(prev => ({ ...prev, grade: e.target.value }))}
                  disabled={newUser.role !== 'student'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    value={newUser.status}
                    onChange={(e) => setNewUser(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => {
                if (!newUser.name.trim() || !newUser.email.trim()) return;
                setUsers(prev => ([
                  ...prev,
                  {
                    ...newUser,
                    id: Date.now(),
                    lastLogin: 'Just now'
                  }
                ]));
                setNewUser({ name: '', email: '', role: 'student', grade: '', status: 'active' });
                setOpenUserDialog(false);
              }}
            >
              Save User
            </Button>
          </DialogActions>
        </Dialog>

        {/* Role Access / Business Settings Tab */}
        {tabValue === 3 && (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Business Settings: Role-Based Sidebar Access</Typography>
              <Button
                variant="contained"
                startIcon={<Settings />}
                onClick={async () => {
                  const serialized = Object.fromEntries(
                    Object.entries(roleAccess).map(([role, set]) => [role, Array.from(set)])
                  );
                  try {
                    if (serverAccessAvailable) {
                      await api.post('/api/admin/role-access', serialized);
                      toast.success('Access saved to server');
                    } else {
                      throw { response: { status: 404 } };
                    }
                  } catch (err) {
                    if (err?.response?.status === 401) {
                      toast('Not authorized on server; saved locally only', { icon: '💾' });
                    } else if (err?.response?.status === 404) {
                      setServerAccessAvailable(false);
                      toast.success('Saved locally. Server endpoint not available yet.', { icon: '💾' });
                    } else {
                      toast.error('Save failed; stored locally for now');
                    }
                  } finally {
                    localStorage.setItem('roleAccess', JSON.stringify(serialized));
                    window.dispatchEvent(new Event('roleAccessUpdated'));
                  }
                }}
              >
                Save Access
              </Button>
            </Box>

            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Toggle which sidebar modules each role can see. This controls navigation visibility; pair with backend permissions.
            </Typography>

            <Grid container spacing={3}>
              {['admin', 'teacher', 'student'].map((role) => (
                <Grid item xs={12} md={4} key={role}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ textTransform: 'capitalize' }}>
                      {role} access
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    {['dashboard', 'subjects', 'assignments', 'content', 'users', 'reports', 'analytics', 'settings', 'business-settings'].map((module) => (
                      <FormControlLabel
                        key={module}
                        control={
                          <Checkbox
                            checked={roleAccess[role]?.has(module)}
                            onChange={(e) => {
                              setRoleAccess(prev => {
                                const next = new Map(Array.from(Object.entries(prev), ([k, v]) => [k, new Set(v)]));
                                const set = next.get(role) || new Set();
                                if (e.target.checked) set.add(module); else set.delete(module);
                                next.set(role, set);
                                return Object.fromEntries(Array.from(next.entries()));
                              });
                            }}
                          />
                        }
                        label={module.charAt(0).toUpperCase() + module.slice(1)}
                      />
                    ))}
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Settings Tab */}
        {tabValue === 4 && (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Settings
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Platform Settings
                  </Typography>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Maintenance Mode</InputLabel>
                    <Select value="off">
                      <MenuItem value="on">On</MenuItem>
                      <MenuItem value="off">Off</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Registration</InputLabel>
                    <Select value="open">
                      <MenuItem value="open">Open</MenuItem>
                      <MenuItem value="closed">Closed</MenuItem>
                      <MenuItem value="invite-only">Invite Only</MenuItem>
                    </Select>
                  </FormControl>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    System Health
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">CPU Usage</Typography>
                    <LinearProgress variant="determinate" value={45} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">Memory Usage</Typography>
                    <LinearProgress variant="determinate" value={62} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">Storage</Typography>
                    <LinearProgress variant="determinate" value={38} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Button variant="contained" startIcon={<Settings />}>
                  Save Settings
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}
      </motion.div>
    </Container>
  );
};

export default AdminDashboard;

