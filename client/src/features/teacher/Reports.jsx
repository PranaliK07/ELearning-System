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
} from '@mui/material';
import {
  GetApp,
  People,
  Assignment,
  EmojiEvents,
  ExpandMore,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
    const headers = ['Student Name', 'Class', 'Score', 'Progress', 'Assignment Completion'];
    const rows = reportData.studentProgress.map(s => [s.name, s.className || 'Unassigned', s.score, s.progress, s.assignmentCompletion ?? 0]);
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
      'Score (%)': s.score,
      'Progress (%)': s.progress,
      'Assignment Completion (%)': s.assignmentCompletion ?? 0
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
      head: [['Student Name', 'Class', 'Score (%)', 'Progress (%)', 'Assignment Completion (%)']],
      body: reportData.studentProgress.map(s => [s.name, s.className || 'Unassigned', `${s.score}%`, `${s.progress}%`, `${s.assignmentCompletion ?? 0}%`]),
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
                  new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Score", bold: true })] })] }),
                  new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Progress", bold: true })] })] }),
                  new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Assignment Completion", bold: true })] })] }),
                ],
              }),
              ...reportData.studentProgress.map(s => new DocxTableRow({
                children: [
                  new DocxTableCell({ children: [new Paragraph(s.name)] }),
                  new DocxTableCell({ children: [new Paragraph(s.className || 'Unassigned')] }),
                  new DocxTableCell({ children: [new Paragraph(s.score.toString() + "%")] }),
                  new DocxTableCell({ children: [new Paragraph(s.progress.toString() + "%")] }),
                  new DocxTableCell({ children: [new Paragraph((s.assignmentCompletion ?? 0).toString() + "%")] }),
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
          <Button 
            variant="outlined" 
            startIcon={<GetApp />} 
            endIcon={<ExpandMore />}
            onClick={handleExportClick}
          >
            Export Report
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleExportClose}
          >
            <MenuItem onClick={exportCSV}>Export as CSV</MenuItem>
            <MenuItem onClick={exportExcel}>Export as Excel</MenuItem>
            <MenuItem onClick={exportPDF}>Export as PDF</MenuItem>
            <MenuItem onClick={exportWord}>Export as Word</MenuItem>
          </Menu>
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
          {[
            ...selectedSummary.slice(3).map((item) => `${item.label}: ${item.value}`),
            reportData.classPerformance.length
              ? `Top Class: ${reportData.classPerformance[0].className} (${reportData.classPerformance[0].avgScore}% score, ${reportData.classPerformance[0].assignmentCompletion}% assignment completion)`
              : null
          ].filter(Boolean).join(' | ') || `Average Score: ${reportData.performanceMetrics.avgScore}% | Completion Rate: ${reportData.performanceMetrics.completionRate} | Assignment Completion: ${reportData.performanceMetrics.assignmentCompletionRate || '0%'} | Total Learning Hours: ${reportData.performanceMetrics.totalHours}h`}
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
                <TableCell align="center">Class</TableCell>
                <TableCell align="center">Quiz Performance</TableCell>
                <TableCell align="center">Lessons Completed</TableCell>
                <TableCell align="center">Assignment Completion</TableCell>
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
                  <TableCell align="center">{row.className || 'Unassigned'}</TableCell>
                  <TableCell align="center">{row.score}%</TableCell>
                  <TableCell align="center">{row.progress}%</TableCell>
                  <TableCell align="center">{row.assignmentCompletion ?? 0}%</TableCell>
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
