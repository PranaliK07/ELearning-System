import React, { useState, useEffect } from 'react';
import {
  Container,
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
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  Stack,
  alpha,
  useTheme
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  People,
  School,
  Assignment as AssignmentIcon,
  TrendingUp,
  Search,
  MoreVert,
  Email,
  Download,
  Person,
  ExpandMore,
  HelpOutline,
  ChatBubbleOutline,
  CheckCircle,
  Pending as PendingIcon,
  Send,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table as DocxTable, TableCell as DocxTableCell, TableRow as DocxTableRow, TextRun, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios.js';
import { toast } from 'react-hot-toast';
import { resolveAvatarSrc } from '../../utils/media';
import DoubtSection from '../doubts/DoubtSection';
import { ThemeContext } from '../../context/ThemeContext';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const { mode } = React.useContext(ThemeContext);
  const [pendingDoubts, setPendingDoubts] = useState([]);
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
  const [columnFilters, setColumnFilters] = useState({
    student: '',
    grade: '',
  });
  const [loading, setLoading] = useState(true);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const exportOpen = Boolean(exportAnchorEl);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = parseInt(searchParams.get('tab')) || 0;
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = parseInt(searchParams.get('tab'));
    if (!isNaN(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };


  const handleExportClick = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

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

      // Fetch doubts to populate the badge count
      try {
        const doubtsRes = await axios.get('/api/doubts/teacher');
        setPendingDoubts(doubtsRes.data.filter(d => d.status === 'pending'));
      } catch (doubtErr) {
        console.error('Failed to fetch doubts for badge count', doubtErr);
      }
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    handleExportClose();
    const headers = ["Name", "Email", "Grade", "Last Active"];
    const rows = data.students.map(s => [
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.Grade?.name || 'N/A'}"`,
      `"${new Date(s.updatedAt).toLocaleDateString()}"`
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, "teacher_data.csv");
    toast.success('Data exported as CSV');
  };

  const exportExcel = () => {
    handleExportClose();
    const exportRows = data.students.map(s => ({
      'Name': s.name,
      'Email': s.email,
      'Grade': s.Grade?.name || 'N/A',
      'Last Active': new Date(s.updatedAt).toLocaleDateString()
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "teacher_data.xlsx");
    toast.success('Data exported as Excel');
  };

  const exportPDF = () => {
    handleExportClose();
    const doc = new jsPDF();
    doc.text("Students Overview Report", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Name', 'Email', 'Grade', 'Last Active']],
      body: data.students.map(s => [s.name, s.email, s.Grade?.name || 'N/A', new Date(s.updatedAt).toLocaleDateString()]),
    });
    doc.save("teacher_data.pdf");
    toast.success('Data exported as PDF');
  };

  const exportWord = () => {
    handleExportClose();
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Students Overview Report",
                bold: true,
                size: 32,
              }),
            ],
            spacing: { after: 400 },
          }),
          new DocxTable({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new DocxTableRow({
                children: [
                  new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Name", bold: true })] })] }),
                  new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Email", bold: true })] })] }),
                  new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Grade", bold: true })] })] }),
                  new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Last Active", bold: true })] })] }),
                ],
              }),
              ...data.students.map(s => new DocxTableRow({
                children: [
                  new DocxTableCell({ children: [new Paragraph(s.name)] }),
                  new DocxTableCell({ children: [new Paragraph(s.email)] }),
                  new DocxTableCell({ children: [new Paragraph(s.Grade?.name || 'N/A')] }),
                  new DocxTableCell({ children: [new Paragraph(new Date(s.updatedAt).toLocaleDateString())] }),
                ],
              })),
            ],
          }),
        ],
      }],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "teacher_data.docx");
      toast.success('Data exported as Word');
    });
  };

  const filteredStudents = data.students.filter(student => {
    const matchesStudent = (student.name || '').toLowerCase().includes(columnFilters.student.toLowerCase()) ||
                           (student.email || '').toLowerCase().includes(columnFilters.student.toLowerCase());
    const matchesGrade = (student.Grade?.name || `Class ${student.grade}` || '').toLowerCase().includes(columnFilters.grade.toLowerCase());
    return matchesStudent && matchesGrade;
  });

  const statsConfig = [
    { label: 'Total Students', value: data.stats.totalStudents, icon: <People />, color: '#006D5B' },
    { label: 'Active Classes', value: data.stats.activeClasses, icon: <School />, color: '#008C75' },
    { label: 'Assignments', value: data.stats.assignments, icon: <AssignmentIcon />, color: '#004D40' },
  ];

  if (loading) {
    return (
      <Box sx={{ mt: 4, px: 1 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }} align="center">Loading teacher dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 1 }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <Box sx={{ 
          mb: 5, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 3,
          p: 3,
          borderRadius: 4,
          background: mode === 'light' 
            ? 'linear-gradient(135deg, rgba(0, 109, 91, 0.08) 0%, rgba(0, 140, 117, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 100%)',
          border: '1px solid',
          borderColor: mode === 'light' ? 'rgba(0, 109, 91, 0.12)' : 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <Box>
            <Typography variant="h4" fontWeight="800" sx={{ color: 'text.primary', letterSpacing: '-0.5px' }}>
              Welcome back, {user?.name}! 👨‍🏫
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
              Here's an overview of your classes and student progress
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<Person />}
              onClick={() => navigate('/profile')}
              sx={{ 
                borderRadius: 3, 
                px: 3, 
                py: 1.2, 
                textTransform: 'none', 
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0, 109, 91, 0.2)',
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              My Profile
            </Button>
          </Stack>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {statsConfig.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                whileHover={{ y: -8 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card sx={{ 
                  bgcolor: stat.color, 
                  color: 'white', 
                  borderRadius: 4, 
                  boxShadow: `0 8px 24px ${alpha(stat.color, 0.25)}`, 
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 800, letterSpacing: 1.5 }}>
                          {stat.label}
                        </Typography>
                        <Typography variant="h3" fontWeight="900" sx={{ mt: 1 }}>
                          {stat.value}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 3, 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        color: 'white'
                      }}>
                        {React.cloneElement(stat.icon, { sx: { fontSize: 32 } })}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
          
          {/* Quick Reports Card */}
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              whileHover={{ y: -8 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 4, 
                border: '2px dashed',
                borderColor: 'divider',
                boxShadow: 'none',
                height: '100%',
                display: 'flex',
                alignItems: 'center'
              }}>
                <CardContent sx={{ textAlign: 'center', width: '100%', p: 3 }}>
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: 1.5, mb: 2, display: 'block' }}>
                    Quick Reports
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<Download />}
                    endIcon={<ExpandMore />}
                    onClick={handleExportClick}
                    fullWidth
                    sx={{ 
                      borderRadius: 3,
                      py: 1.5,
                      fontWeight: 800,
                      textTransform: 'none',
                      boxShadow: '0 4px 14px 0 rgba(76, 175, 80, 0.3)'
                    }}
                  >
                    Export Data
                  </Button>
                  <Menu
                    anchorEl={exportAnchorEl}
                    open={exportOpen}
                    onClose={handleExportClose}
                    PaperProps={{
                      sx: { 
                        borderRadius: 3, 
                        mt: 1, 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        minWidth: 200
                      }
                    }}
                  >
                    <MenuItem onClick={exportCSV} sx={{ py: 1.5 }}>Export as CSV</MenuItem>
                    <MenuItem onClick={exportExcel} sx={{ py: 1.5 }}>Export as Excel</MenuItem>
                    <MenuItem onClick={exportPDF} sx={{ py: 1.5 }}>Export as PDF</MenuItem>
                    <MenuItem onClick={exportWord} sx={{ py: 1.5 }}>Export as Word</MenuItem>
                  </Menu>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Recent Submissions */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 4, borderRadius: 4, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h6" fontWeight="800">
                  Recent Submissions
                </Typography>
                <Chip label={`${data.recentSubmissions.length} New`} size="small" color="primary" sx={{ fontWeight: 700 }} />
              </Box>

              {data.recentSubmissions.length > 0 ? (
                <Stack spacing={3}>
                  {data.recentSubmissions.map((sub) => (
                    <Box key={sub.id} sx={{ 
                      p: 2, 
                      borderRadius: 3, 
                      bgcolor: 'action.hover',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: 'action.selected' }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <Avatar 
                          src={resolveAvatarSrc(sub.student?.avatar)} 
                          sx={{ width: 40, height: 40, mr: 2, border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} 
                        />
                        <Box>
                          <Typography variant="subtitle2" fontWeight="700">{sub.student?.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(sub.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ pl: 7 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                          Submitted: <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>{sub.Assignment?.title}</Box>
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Avatar sx={{ width: 80, height: 80, bgcolor: 'action.hover', mx: 'auto', mb: 2 }}>
                    <AssignmentIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                  </Avatar>
                  <Typography color="textSecondary" fontWeight="600">No recent submissions</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Students Table */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="800">
                  Students Overview
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Manage and monitor your students' activity
                </Typography>
              </Box>

              <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, bgcolor: 'background.paper', py: 2 }}>
                        Student
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Search name/email..."
                          value={columnFilters.student}
                          onChange={(e) => setColumnFilters(prev => ({ ...prev, student: e.target.value }))}
                          sx={{ mt: 1.5, '& .MuiInputBase-root': { fontSize: '0.85rem', borderRadius: 2, bgcolor: 'action.hover' } }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search fontSize="small" sx={{ color: 'text.disabled' }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, bgcolor: 'background.paper', py: 2 }}>
                        Grade
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Filter class..."
                          value={columnFilters.grade}
                          onChange={(e) => setColumnFilters(prev => ({ ...prev, grade: e.target.value }))}
                          sx={{ mt: 1.5, '& .MuiInputBase-root': { fontSize: '0.85rem', borderRadius: 2, bgcolor: 'action.hover' } }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, bgcolor: 'background.paper', py: 2 }}>Last Active</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, bgcolor: 'background.paper', py: 2 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ mr: 2, bgcolor: 'primary.light', width: 44, height: 44, fontWeight: 700 }} 
                              src={resolveAvatarSrc(student.avatar)}
                            >
                              {student.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="700">{student.name}</Typography>
                              <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Email sx={{ fontSize: 12 }} /> {student.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={student.Grade?.name || (student.grade ? `Class ${student.grade}` : 'Unassigned')} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontWeight: 700, borderRadius: 2, color: 'primary.main', borderColor: 'primary.light' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            {new Date(student.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Send Email">
                            <IconButton 
                              size="medium" 
                              onClick={() => window.location.href = `mailto:${student.email}`}
                              sx={{ 
                                bgcolor: 'primary.light', 
                                color: 'primary.main',
                                '&:hover': { bgcolor: 'primary.main', color: 'white' },
                                transition: 'all 0.2s',
                                borderRadius: 2
                              }}
                            >
                              <Email fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                          <Box sx={{ opacity: 0.5 }}>
                            <Search sx={{ fontSize: 48, mb: 1 }} />
                            <Typography variant="h6" fontWeight="700">No students found</Typography>
                            <Typography variant="body2">Try adjusting your search filters</Typography>
                          </Box>
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
    </Box>
  );
};

export default TeacherDashboard;
