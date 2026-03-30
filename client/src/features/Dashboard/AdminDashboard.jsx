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
  Menu,
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
  DialogActions,
  CircularProgress
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
  Settings,
  Refresh,
  Download,
  ExpandMore
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, Table as DocxTable, TableCell as DocxTableCell, TableRow as DocxTableRow, TextRun, WidthType } from 'docx';
import { saveAs } from 'file-saver';
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
  const [editingUserId, setEditingUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const exportOpen = Boolean(exportAnchorEl);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student',
    grade: '',
    studentEmail: '',
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
    setLoading(true);
    try {
      // Fetch users
      const usersRes = await api.get('/api/users');
      const usersData = Array.isArray(usersRes.data) ? usersRes.data : 
                       (usersRes.data?.users ? usersRes.data.users : []);
      setUsers(usersData);
      console.log('Users fetched:', usersData.length);

      // Fetch content with better error handling
      try {
        const contentRes = await api.get('/api/content');
        console.log('Content API response:', contentRes.data);
        
        let contentData = [];
        
        // Handle different response structures
        if (Array.isArray(contentRes.data)) {
          contentData = contentRes.data;
        } else if (contentRes.data?.content) {
          contentData = contentRes.data.content;
        } else if (contentRes.data?.data) {
          contentData = contentRes.data.data;
        } else if (contentRes.data?.items) {
          contentData = contentRes.data.items;
        } else if (contentRes.data?.lessons) {
          contentData = contentRes.data.lessons;
        } else if (contentRes.data?.courses) {
          contentData = contentRes.data.courses;
        } else if (contentRes.data?.materials) {
          contentData = contentRes.data.materials;
        } else if (typeof contentRes.data === 'object' && contentRes.data !== null) {
          // If it's a single content object, wrap it in an array
          if (contentRes.data.id || contentRes.data._id) {
            contentData = [contentRes.data];
          }
        }
        
        setContent(contentData);
        console.log('Content fetched:', contentData.length);
        
      } catch (contentErr) {
        console.error('Error fetching content:', contentErr);
        if (contentErr.response?.status === 404) {
          console.log('Content endpoint not found');
        } else {
          toast.error('Failed to fetch content data');
        }
        setContent([]);
      }

      // Fetch reports
      try {
        const reportsRes = await api.get('/api/reports');
        const reportsData = Array.isArray(reportsRes.data) ? reportsRes.data :
                           (reportsRes.data?.reports ? reportsRes.data.reports : []);
        setReports(reportsData);
        console.log('Reports fetched:', reportsData.length);
      } catch (err) {
        console.log('Reports endpoint not available yet');
        setReports([]);
      }

    } catch (err) {
      console.error('Error fetching admin data:', err);
      toast.error('Failed to fetch dashboard data');
      setUsers([]);
      setContent([]);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAdminData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
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
      setUsers(prev => prev.filter(u => u.id !== userId && u._id !== userId));
      toast.success('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user');
    }
  };

  const handleDeleteContent = async (contentId) => {
    try {
      await api.delete(`/api/content/${contentId}`);
      setContent(prev => prev.filter(c => c.id !== contentId && c._id !== contentId));
      toast.success('Content deleted successfully');
    } catch (err) {
      console.error('Error deleting content:', err);
      toast.error('Failed to delete content');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExportClick = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const exportRows = reports.map((report) => ({
    type: report.type || 'general',
    title: report.title || 'Untitled',
    reportedBy: report.user || report.reportedBy || 'Anonymous',
    date: report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A',
    status: report.status || 'pending'
  }));

  const exportCSV = () => {
    handleExportClose();
    const headers = ['Type', 'Title', 'Reported By', 'Date', 'Status'];
    const rows = exportRows.map((row) => [row.type, row.title, row.reportedBy, row.date, row.status]);
    const csvContent = `data:text/csv;charset=utf-8,${headers.join(',')}\n${rows.map((r) => r.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')}`;
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'reports_issues.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Reports exported as CSV');
  };

  const exportExcel = () => {
    handleExportClose();
    const worksheet = XLSX.utils.json_to_sheet(exportRows.map((row) => ({
      Type: row.type,
      Title: row.title,
      'Reported By': row.reportedBy,
      Date: row.date,
      Status: row.status
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');
    XLSX.writeFile(workbook, 'reports_issues.xlsx');
    toast.success('Reports exported as Excel');
  };

  const exportPDF = () => {
    handleExportClose();
    const doc = new jsPDF();
    doc.text('Reports & Issues', 14, 15);
    doc.autoTable({
      startY: 20,
      head: [['Type', 'Title', 'Reported By', 'Date', 'Status']],
      body: exportRows.map((row) => [row.type, row.title, row.reportedBy, row.date, row.status])
    });
    doc.save('reports_issues.pdf');
    toast.success('Reports exported as PDF');
  };

  const exportWord = () => {
    handleExportClose();
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Reports & Issues', bold: true, size: 32 })],
            spacing: { after: 400 }
          }),
          new DocxTable({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE
            },
            rows: [
              new DocxTableRow({
                children: [
                  new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Type', bold: true })] })] }),
                  new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Title', bold: true })] })] }),
                  new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Reported By', bold: true })] })] }),
                  new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Date', bold: true })] })] }),
                  new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Status', bold: true })] })] })
                ]
              }),
              ...exportRows.map((row) => new DocxTableRow({
                children: [
                  new DocxTableCell({ children: [new Paragraph(row.type)] }),
                  new DocxTableCell({ children: [new Paragraph(row.title)] }),
                  new DocxTableCell({ children: [new Paragraph(row.reportedBy)] }),
                  new DocxTableCell({ children: [new Paragraph(row.date)] }),
                  new DocxTableCell({ children: [new Paragraph(row.status)] })
                ]
              }))
            ]
          })
        ]
      }]
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, 'reports_issues.docx');
      toast.success('Reports exported as Word');
    });
  };

  const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
    const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Calculate stats with proper null/undefined checks
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => {
      const status = u.status || u.isActive || u.active;
      return status === 'active' || status === 'Active' || status === true;
    }).length,
    totalStudents: users.filter(u => {
      const role = u.role || u.userRole;
      return role === 'student' || role === 'Student';
    }).length,
    totalTeachers: users.filter(u => {
      const role = u.role || u.userRole;
      return role === 'teacher' || role === 'Teacher';
    }).length,
    totalContent: content.length,
    totalReports: reports.filter(r => {
      const status = r.status || r.reportStatus;
      return status !== 'resolved' && status !== 'Resolved';
    }).length
  };

  // Debug log
  console.log('Stats calculated:', stats);
  console.log('Content items:', content);

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header with Refresh Button */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Admin Dashboard 👑
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Manage users, content, and monitor platform activity
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
              <Typography variant="h6">
                User Management
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
                  <InputLabel>Filter by Role</InputLabel>
                  <Select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    label="Filter by Role"
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="student">Students</MenuItem>
                    <MenuItem value="teacher">Teachers</MenuItem>
                    <MenuItem value="parent">Parents</MenuItem>
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
                  sx={{ width: { xs: '100%', sm: 250 } }}
                />
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                  onClick={() => {
                    setEditingUserId(null);
                    setNewUser({ name: '', email: '', role: 'student', grade: '', studentEmail: '', status: 'active' });
                    setOpenUserDialog(true);
                  }}
                >
                  Add User
                </Button>
              </Box>
            </Box>

            {loading ? (
              <LinearProgress />
            ) : (
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
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="textSecondary">
                            No users found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id || user._id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                                {(user.name || 'U').charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2">{user.name || 'Unknown'}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {user.email || 'No email'}
                                </Typography>
                                {user.role === 'student' && user.parent && (
                                  <Typography variant="caption" color="textSecondary" display="block">
                                    Parent: {user.parent.name} ({user.parent.email})
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.role || 'student'}
                              size="small"
                              color={
                                user.role === 'admin' ? 'error' :
                                  user.role === 'teacher' ? 'warning' :
                                    user.role === 'parent' ? 'secondary' : 'primary'
                              }
                            />
                          </TableCell>
                          <TableCell>{user.grade || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.status || 'active'}
                              size="small"
                              color={(user.status === 'active' || user.status === 'Active') ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>{user.lastLogin || 'Never'}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingUserId(user.id || user._id);
                                setNewUser({
                                  name: user.name || '',
                                  email: user.email || '',
                                  role: user.role || 'student',
                                  grade: user.grade || '',
                                  studentEmail: '',
                                  status: (user.status === 'inactive' || user.isActive === false) ? 'inactive' : 'active'
                                });
                                setOpenUserDialog(true);
                              }}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                if (window.confirm('Delete this user? This cannot be undone.')) {
                                  handleDeleteUser(user.id || user._id);
                                }
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
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

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
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
                    {content.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Box sx={{ py: 4 }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              No content available
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Add />}
                              onClick={() => navigate('/content/create')}
                              sx={{ mt: 1 }}
                            >
                              Create your first content
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      content.map((item) => (
                        <TableRow key={item.id || item._id} hover>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {item.title || item.name || 'Untitled'}
                            </Typography>
                            {item.description && (
                              <Typography variant="caption" color="textSecondary" display="block">
                                {item.description.substring(0, 60)}...
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.type || item.contentType || 'unknown'}
                              size="small"
                              color={
                                item.type === 'video' ? 'primary' :
                                item.type === 'quiz' ? 'warning' : 
                                item.type === 'assignment' ? 'success' : 'secondary'
                              }
                            />
                          </TableCell>
                          <TableCell>{item.grade || item.gradeLevel || 'N/A'}</TableCell>
                          <TableCell>{item.subject || 'N/A'}</TableCell>
                          <TableCell>
                            {item.views || item.attempts || item.downloads || 0}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.status || 'draft'}
                              size="small"
                              color={item.status === 'published' ? 'success' : 
                                     item.status === 'draft' ? 'default' : 'warning'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton 
                              size="small"
                              onClick={() => navigate(`/content/edit/${item.id || item._id}`)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => {
                                if (window.confirm('Delete this content? This cannot be undone.')) {
                                  handleDeleteContent(item.id || item._id);
                                }
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {/* Content Summary Cards */}
            {content.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Content Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6">{content.filter(c => c.type === 'video' || c.contentType === 'video').length}</Typography>
                        <Typography variant="caption">Videos</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6">{content.filter(c => c.type === 'quiz' || c.contentType === 'quiz').length}</Typography>
                        <Typography variant="caption">Quizzes</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6">{content.filter(c => c.type === 'assignment' || c.contentType === 'assignment').length}</Typography>
                        <Typography variant="caption">Assignments</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6">{content.filter(c => c.status === 'published').length}</Typography>
                        <Typography variant="caption">Published</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        )}

        {/* Reports Tab */}
        {tabValue === 2 && (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                Reports & Issues
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Download />}
                endIcon={<ExpandMore />}
                onClick={handleExportClick}
                disabled={reports.length === 0}
              >
                Export Reports
              </Button>
              <Menu
                anchorEl={exportAnchorEl}
                open={exportOpen}
                onClose={handleExportClose}
              >
                <MenuItem onClick={exportCSV}>Export as CSV</MenuItem>
                <MenuItem onClick={exportExcel}>Export as Excel</MenuItem>
                <MenuItem onClick={exportPDF}>Export as PDF</MenuItem>
                <MenuItem onClick={exportWord}>Export as Word</MenuItem>
              </Menu>
            </Box>

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
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="textSecondary">
                          No reports available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow key={report.id || report._id} hover>
                        <TableCell>
                          <Chip
                            label={report.type || 'general'}
                            size="small"
                            color={
                              report.type === 'bug' ? 'error' :
                                report.type === 'feedback' ? 'info' : 'warning'
                            }
                          />
                        </TableCell>
                        <TableCell>{report.title || 'Untitled'}</TableCell>
                        <TableCell>{report.user || report.reportedBy || 'Anonymous'}</TableCell>
                        <TableCell>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : (report.date || 'N/A')}</TableCell>
                        <TableCell>
                          <Chip
                            label={report.status || 'pending'}
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
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Add / Edit User Dialog */}
        <Dialog
          open={openUserDialog}
          onClose={() => {
            setOpenUserDialog(false);
            setEditingUserId(null);
          }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>{editingUserId ? 'Edit User' : 'Add New User'}</DialogTitle>
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
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value, studentEmail: '' }))}
                  >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="teacher">Teacher</MenuItem>
                    <MenuItem value="parent">Parent</MenuItem>
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
              {newUser.role === 'parent' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Student Email to Link"
                    value={newUser.studentEmail}
                    onChange={(e) => setNewUser(prev => ({ ...prev, studentEmail: e.target.value }))}
                    placeholder="Optional"
                  />
                </Grid>
              )}
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
            <Button
              onClick={() => {
                setOpenUserDialog(false);
                setEditingUserId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={async () => {
                if (!newUser.name.trim() || !newUser.email.trim()) {
                  toast.error('Please fill in all required fields');
                  return;
                }

                try {
                  const payload = {
                    name: newUser.name.trim(),
                    email: newUser.email.trim(),
                    role: newUser.role,
                    grade: newUser.role === 'student' && newUser.grade ? Number(newUser.grade) : null,
                    isActive: newUser.status === 'active',
                    studentEmail: newUser.role === 'parent' && newUser.studentEmail ? newUser.studentEmail.trim() : undefined
                  };

                  let response;

                  if (editingUserId) {
                    response = await api.put(`/api/users/${editingUserId}`, payload);
                    await fetchAdminData();
                  } else {
                    try {
                      response = await api.post('/api/users', payload);
                    } catch (postErr) {
                      if (postErr?.response?.status === 404) {
                        // Compatibility fallback for deployments that expose admin-managed user creation under /api/admin/users
                        response = await api.post('/api/admin/users', payload);
                      } else {
                        throw postErr;
                      }
                    }
                    const createdUser = response?.data?.user;

                    if (createdUser) {
                      setUsers(prev => [{ ...createdUser, status: createdUser.isActive ? 'active' : 'inactive' }, ...prev]);
                    } else {
                      await fetchAdminData();
                    }
                  }

                  setNewUser({ name: '', email: '', role: 'student', grade: '', studentEmail: '', status: 'active' });
                  setOpenUserDialog(false);
                  setEditingUserId(null);

                  const tempPassword = response?.data?.temporaryPassword;
                  if (!editingUserId && tempPassword) {
                    toast.success(`User added. Temporary password: ${tempPassword}`);
                  } else {
                    toast.success(response?.data?.message || (editingUserId ? 'User updated successfully' : 'User added successfully'));
                  }
                } catch (err) {
                  toast.error(err?.response?.data?.message || (editingUserId ? 'Failed to update user' : 'Failed to add user'));
                }
              }}
            >
              {editingUserId ? 'Update User' : 'Save User'}
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
                    {['dashboard', 'subjects', 'assignments', 'communications', 'content', 'users', 'reports', 'analytics', 'settings', 'business-settings'].map((module) => (
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
