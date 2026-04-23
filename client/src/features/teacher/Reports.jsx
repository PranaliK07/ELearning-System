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
  Menu,
  MenuItem,
  LinearProgress,
  Stack,
  Avatar,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  GetApp,
  People,
  Assignment,
  EmojiEvents,
  ExpandMore,
  Group,
  CheckCircle,
  AccessTime,
  TrendingUp,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table as DocxTable, TableCell as DocxTableCell, TableRow as DocxTableRow, TextRun, WidthType } from 'docx';
import { saveAs } from 'file-saver';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [period, setPeriod] = useState('daily');
  const [reportData, setReportData] = useState({
    summary: {},
    studentProgress: [],
    classPerformance: [],
    weeklyActivity: [],
    performanceMetrics: {
      avgScore: 0,
      completionRate: '0%',
      assignmentCompletionRate: '0%',
      totalHours: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

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
        classPerformance: response.data?.classPerformance || [],
        weeklyActivity: response.data?.weeklyActivity || [],
        performanceMetrics: response.data?.performanceMetrics || {
          avgScore: 0,
          completionRate: '0%',
          assignmentCompletionRate: '0%',
          totalHours: 0,
        },
      });
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      toast.error(apiMessage || 'Failed to load report data');
      setReportData({
        summary: {},
        studentProgress: [],
        classPerformance: [],
        weeklyActivity: [],
        performanceMetrics: {
          avgScore: 0,
          completionRate: '0%',
          assignmentCompletionRate: '0%',
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
      { label: 'Assignment Completion', value: `${reportData.summary.assignmentCompletionPercentage ?? 0}%` },
    ],
    weekly: [
      { label: 'Total Active Users (Week)', value: reportData.summary.totalActiveUsersThisWeek ?? 0 },
      { label: 'Total Videos Watched', value: reportData.summary.totalVideosWatched ?? 0 },
      { label: 'Average Progress / Student', value: `${reportData.summary.averageProgressPerStudent ?? 0}%` },
      { label: 'Most Active Subject', value: reportData.summary.mostActiveSubject || 'N/A' },
      { label: 'Assignment Completion', value: `${reportData.summary.assignmentCompletionPercentage ?? 0}%` },
    ],
    monthly: [
      { label: 'Total Users', value: reportData.summary.totalUsers ?? 0 },
      { label: 'Total Completed Topics', value: reportData.summary.totalCompletedTopics ?? 0 },
      { label: 'Total Videos Watched', value: reportData.summary.totalVideosWatched ?? 0 },
      { label: 'Top Performing Students', value: reportData.summary.topPerformingStudents?.length ?? 0 },
      { label: 'Overall Progress', value: `${reportData.summary.overallProgressPercentage ?? 0}%` },
      { label: 'Assignment Completion', value: `${reportData.summary.assignmentCompletionPercentage ?? 0}%` },
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
    handleExportClose();
    const headers = ['Student Name', 'Class', 'Quiz Performance', 'Lesson Progress', 'Assignment Completion', 'Attendance', 'Overall Performance'];
    const rows = reportData.studentProgress.map(s => [
      s.name,
      s.className || 'Unassigned',
      `${s.score}%`,
      `${s.progress}%`,
      `${s.assignmentCompletion}%`,
      `${s.attendancePercentage ?? 0}%`,
      `${s.overallPerformance ?? 0}%`
    ]);
    let csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student_report_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    toast.success('CSV Report exported');
  };

  const exportExcel = () => {
    handleExportClose();
    const data = reportData.studentProgress.map(s => ({
      'Student Name': s.name,
      'Class': s.className || 'Unassigned',
      'Quiz Performance (%)': s.score,
      'Lesson Progress (%)': s.progress,
      'Assignment Completion (%)': s.assignmentCompletion,
      'Attendance (%)': s.attendancePercentage ?? 0,
      'Overall Performance (%)': s.overallPerformance ?? 0
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, `student_report_${period}.xlsx`);
    toast.success('Excel Report exported');
  };

  const exportPDF = () => {
    handleExportClose();
    const doc = new jsPDF();
    doc.text(`Student Performance Report - ${period.toUpperCase()}`, 14, 15);
    doc.autoTable({
      startY: 20,
      head: [['Student Name', 'Class', 'Quiz (%)', 'Lesson (%)', 'Assign (%)', 'Att (%)', 'Overall (%)']],
      body: reportData.studentProgress.map(s => [
        s.name,
        s.className || 'Unassigned',
        `${s.score}%`,
        `${s.progress}%`,
        `${s.assignmentCompletion}%`,
        `${s.attendancePercentage ?? 0}%`,
        `${s.overallPerformance ?? 0}%`
      ]),
    });
    doc.save(`student_report_${period}.pdf`);
    toast.success('PDF Report exported');
  };

  const exportWord = () => {
    handleExportClose();
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `Student Performance Report - ${period.toUpperCase()}`,
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
                  new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Student Name", bold: true })] })] }),
                  new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Class", bold: true })] })] }),
                  new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Quiz", bold: true })] })] }),
                  new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Lesson", bold: true })] })] }),
                  new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Assignment", bold: true })] })] }),
                  new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Attendance", bold: true })] })] }),
                  new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Overall", bold: true })] })] }),
                ],
              }),
              ...reportData.studentProgress.map(s => new DocxTableRow({
                children: [
                  new DocxTableCell({ children: [new Paragraph(s.name)] }),
                  new DocxTableCell({ children: [new Paragraph(s.className || 'Unassigned')] }),
                  new DocxTableCell({ children: [new Paragraph(s.score.toString() + "%")] }),
                  new DocxTableCell({ children: [new Paragraph(s.progress.toString() + "%")] }),
                  new DocxTableCell({ children: [new Paragraph(s.assignmentCompletion.toString() + "%")] }),
                  new DocxTableCell({ children: [new Paragraph((s.attendancePercentage ?? 0).toString() + "%")] }),
                  new DocxTableCell({ children: [new Paragraph((s.overallPerformance ?? 0).toString() + "%")] }),
                ],
              })),
            ],
          }),
        ],
      }],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `student_report_${period}.docx`);
      toast.success('Word Report exported');
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 3,
        mb: 4
      }}>
        <Box>
          <Typography variant="h4" fontWeight="900" sx={{ color: 'text.primary', mb: 1, fontFamily: '"Outfit", sans-serif' }}>
            Academic Reports 📈
          </Typography>
          <Typography color="textSecondary">Analyze student performance and learning engagement metrics.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
          <ButtonGroup variant="outlined" size="small" sx={{ width: { xs: '100%', sm: 'auto' } }}>
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
          <Button
            variant="outlined"
            startIcon={<GetApp />}
            endIcon={<ExpandMore />}
            onClick={handleExportClick}
            fullWidth={isMobile}
          >
            Export
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleExportClose}
            PaperProps={{ sx: { borderRadius: 2, mt: 1, minWidth: 180, boxShadow: 4 } }}
          >
            <MenuItem onClick={exportCSV}>Export CSV</MenuItem>
            <MenuItem onClick={exportExcel}>Export Excel</MenuItem>
            <MenuItem onClick={exportPDF}>Export PDF</MenuItem>
            <MenuItem onClick={exportWord}>Export Word</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <ReportStatCard label="Active Students" value={reportData.summary.activeStudents || 0} icon={Group} color="#1a237e" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <ReportStatCard label="Lessons Completed" value={reportData.summary.lessonsCompleted || 0} icon={CheckCircle} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <ReportStatCard label="Watch Time" value={`${reportData.performanceMetrics.totalHours}h`} icon={AccessTime} color="#f50057" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <ReportStatCard label="Avg Score" value={`${reportData.performanceMetrics.avgScore}%`} icon={TrendingUp} color="#ff9800" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <ReportStatCard label="Assignment Comp." value={reportData.performanceMetrics.assignmentCompletionRate} icon={Assignment} color="#673ab7" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>Student Performance</Typography>
            <Box sx={{ height: { xs: 220, sm: 300 } }}>
              <Bar data={barData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>{period === 'monthly' ? 'Monthly Student Activity' : period === 'daily' ? 'Daily Student Activity' : 'Weekly Student Activity'}</Typography>
            <Box sx={{ height: { xs: 220, sm: 300 } }}>
              <Line data={lineData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 4, borderRadius: isMobile ? 3 : 6, overflow: 'hidden', border: '1px solid', borderColor: 'rgba(0,0,0,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)', bgcolor: alpha('#0B1F3B', 0.02) }}>
          <Typography variant="h6" fontWeight="800" sx={{ color: '#0B1F3B' }}>Student Performance Rankings</Typography>
        </Box>
        {isMobile ? (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {reportData.studentProgress.map((row) => (
              <Paper key={row.name} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography fontWeight="bold" variant="subtitle1">{row.name}</Typography>
                    <Typography variant="caption" color="textSecondary">{row.className || 'Unassigned'}</Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: alpha(row.overallPerformance > 80 ? theme.palette.success.main : row.overallPerformance > 50 ? theme.palette.warning.main : theme.palette.error.main, 0.1),
                      color: row.overallPerformance > 80 ? 'success.main' : row.overallPerformance > 50 ? 'warning.main' : 'error.main'
                    }}
                  >
                    {row.overallPerformance > 80 ? 'Excellent' : row.overallPerformance > 50 ? 'On Track' : 'Needs Review'}
                  </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="textSecondary" display="block">Quiz</Typography>
                    <Typography variant="body2" fontWeight="bold">{row.score}%</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="textSecondary" display="block">Lesson</Typography>
                    <Typography variant="body2" fontWeight="bold">{row.progress}%</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="textSecondary" display="block">Assign.</Typography>
                    <Typography variant="body2" fontWeight="bold">{row.assignmentCompletion}%</Typography>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="textSecondary" gutterBottom display="block">Overall Performance</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={row.overallPerformance ?? 0}
                        sx={{ flex: 1, height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { bgcolor: row.overallPerformance > 80 ? 'success.main' : row.overallPerformance > 50 ? 'warning.main' : 'error.main' } }}
                      />
                      <Typography variant="body2" fontWeight="bold">{row.overallPerformance ?? 0}%</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="caption" color="textSecondary">
                    Last active: {row.lastActive ? new Date(row.lastActive).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 900 }}>
              <TableHead sx={{ bgcolor: alpha('#0B1F3B', 0.02) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Student Name</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Class</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Quiz Perf.</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Lesson Prog.</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Assign. Comp.</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Attendance</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Overall Performance</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Last Active</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.studentProgress.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="center">{row.className || 'Unassigned'}</TableCell>
                    <TableCell align="center">{row.score}%</TableCell>
                    <TableCell align="center">{row.progress}%</TableCell>
                    <TableCell align="center">{row.assignmentCompletion}%</TableCell>
                    <TableCell align="center">{row.attendancePercentage ?? 0}%</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                        <Typography fontWeight="bold">{row.overallPerformance ?? 0}%</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={row.overallPerformance ?? 0}
                          sx={{ width: 50, height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { bgcolor: row.overallPerformance > 80 ? 'success.main' : row.overallPerformance > 50 ? 'warning.main' : 'error.main' } }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">{row.lastActive ? new Date(row.lastActive).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell align="right">
                      <Typography color={row.overallPerformance > 80 ? 'success.main' : row.overallPerformance > 50 ? 'warning.main' : 'error.main'} fontWeight="bold">
                        {row.overallPerformance > 80 ? 'Excellent' : row.overallPerformance > 50 ? 'On Track' : 'Needs Review'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container >
  );
};

const ReportStatCard = ({ label, value, icon: Icon, color }) => (
  <Card sx={{
    borderRadius: 4,
    border: '1px solid',
    borderColor: alpha(color, 0.1),
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: `0 10px 20px ${alpha(color, 0.1)}`
    }
  }}>
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, width: 45, height: 45 }}>
          <Icon />
        </Avatar>
        <Box>
          <Typography variant="caption" color="textSecondary" fontWeight="600">{label}</Typography>
          <Typography variant="h5" fontWeight="900" sx={{ color: color }}>{value}</Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

export default Reports;
