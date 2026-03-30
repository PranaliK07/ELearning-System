import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  useTheme,
  alpha,
  Stack,
  Skeleton,
  useMediaQuery,
  Alert,
  AlertTitle,
  Collapse
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
  Today as TodayIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-hot-toast';

const HomeworkList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/assignments');
      setAssignments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch assignments error', err);
      toast.error('Failed to load homework');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const toggleSubjectExpand = (subjectId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  const getDueStatus = (dueDate) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const due = new Date(dueDate);
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    if (dueDay.getTime() === today.getTime()) {
      return { label: 'Today', color: 'error', icon: <TodayIcon fontSize="small" /> };
    }
    if (dueDay.getTime() === tomorrow.getTime()) {
      return { label: 'Tomorrow', color: 'warning', icon: <ScheduleIcon fontSize="small" /> };
    }
    if (dueDay < today) {
      return { label: 'Overdue', color: 'error', icon: <ErrorIcon fontSize="small" /> };
    }
    return { 
      label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
      color: 'default', 
      icon: <ScheduleIcon fontSize="small" /> 
    };
  };

  const getAssignmentStatus = (assignment) => {
    const submission = assignment.Submissions?.[0];
    if (submission) {
      return { label: 'Completed', color: 'success', icon: <CheckCircleIcon fontSize="small" /> };
    }
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    if (now > dueDate) {
      return { label: 'Overdue', color: 'error', icon: <ErrorIcon fontSize="small" /> };
    }
    return { label: 'Pending', color: 'warning', icon: <ScheduleIcon fontSize="small" /> };
  };

  // Group assignments by Subject and then by Topic/Lesson
  const groupedData = assignments.reduce((acc, assignment) => {
    const subjectName = assignment.Subject?.name || 'General';
    const lessonName = assignment.Lesson?.title || 'General';
    
    if (!acc[subjectName]) {
      acc[subjectName] = {
        subject: subjectName,
        lessons: {}
      };
    }
    
    if (!acc[subjectName].lessons[lessonName]) {
      acc[subjectName].lessons[lessonName] = {
        lesson: lessonName,
        assignments: []
      };
    }
    
    acc[subjectName].lessons[lessonName].assignments.push(assignment);
    return acc;
  }, {});

  const subjects = Object.values(groupedData);
  
  // Calculate counts for header
  const completedCount = assignments.filter(a => !!a.Submissions?.[0]).length;
  const pendingCount = assignments.filter(a => !a.Submissions?.[0] && new Date(a.dueDate) >= new Date()).length;
  const overdueCount = assignments.filter(a => !a.Submissions?.[0] && new Date(a.dueDate) < new Date()).length;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={200} height={48} />
          <Skeleton variant="text" width={300} height={24} />
        </Box>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          fontWeight="bold" 
          gutterBottom 
          sx={{ 
            color: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <AssignmentIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
          Assignments
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="textSecondary">
            Total: <strong>{assignments.length}</strong>
          </Typography>
          <Typography variant="body2" color="success.main">
            Completed: <strong>{completedCount}</strong>
          </Typography>
          <Typography variant="body2" color="warning.main">
            Pending: <strong>{pendingCount}</strong>
          </Typography>
          <Typography variant="body2" color="error.main">
            Overdue: <strong>{overdueCount}</strong>
          </Typography>
        </Stack>
      </Box>

      {/* Assignments */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {isMobile ? (
          <Box sx={{ p: 2 }}>
            {subjects.map((subject) => (
              <Box key={subject.subject} sx={{ mb: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, borderRadius: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleSubjectExpand(subject.subject)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small">
                      {expandedSubjects[subject.subject] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {subject.subject}
                    </Typography>
                  </Box>
                  <Chip label={`${Object.keys(subject.lessons).length} topics`} size="small" />
                </Box>

                <Collapse in={expandedSubjects[subject.subject]}>
                  <Box sx={{ p: 1.5 }}>
                    {Object.values(subject.lessons).map((lesson) => (
                      <Box key={lesson.lesson} sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle2" color="primary" fontWeight="medium" sx={{ mb: 1 }}>
                          {lesson.lesson}
                        </Typography>
                        <Stack spacing={1}>
                          {lesson.assignments.map((assignment) => {
                            const status = getAssignmentStatus(assignment);
                            const dueStatus = getDueStatus(assignment.dueDate);
                            return (
                              <Paper key={assignment.id} sx={{ p: 1.5, borderRadius: 2 }}>
                                <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5 }}>
                                  {assignment.title}
                                </Typography>
                                {assignment.description && (
                                  <Typography variant="caption" color="textSecondary">
                                    {assignment.description.length > 80
                                      ? `${assignment.description.substring(0, 80)}...`
                                      : assignment.description}
                                  </Typography>
                                )}
                                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                                  <Chip
                                    icon={status.icon}
                                    label={status.label}
                                    color={status.color}
                                    size="small"
                                    sx={{ fontWeight: 'bold' }}
                                  />
                                  <Chip
                                    icon={dueStatus.icon}
                                    label={dueStatus.label}
                                    color={dueStatus.color}
                                    size="small"
                                    variant={dueStatus.color === 'default' ? 'outlined' : 'filled'}
                                  />
                                </Stack>
                                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => navigate(`/assignments/view/${assignment.id}`)}
                                  >
                                    View
                                  </Button>
                                </Box>
                              </Paper>
                            );
                          })}
                        </Stack>
                      </Box>
                    ))}
                  </Box>
                </Collapse>
              </Box>
            ))}
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Topic</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Assignment</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Due Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.map((subject) => (
                  <React.Fragment key={subject.subject}>
                    {/* Subject Row */}
                    <TableRow 
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                        cursor: 'pointer',
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                      }}
                      onClick={() => toggleSubjectExpand(subject.subject)}
                    >
                      <TableCell colSpan={5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconButton size="small">
                            {expandedSubjects[subject.subject] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {subject.subject}
                          </Typography>
                          <Chip 
                            label={`${Object.keys(subject.lessons).length} topics`} 
                            size="small" 
                            sx={{ ml: 1 }}
                          />
                        </Stack>
                      </TableCell>
                    </TableRow>
                    
                    {/* Lessons and Assignments */}
                    <Collapse in={expandedSubjects[subject.subject]}>
                      {Object.values(subject.lessons).map((lesson) => (
                        <React.Fragment key={lesson.lesson}>
                          {/* Lesson Row */}
                          <TableRow sx={{ bgcolor: alpha(theme.palette.grey[500], 0.02) }}>
                            <TableCell></TableCell>
                            <TableCell colSpan={4}>
                              <Typography variant="subtitle2" fontWeight="medium" color="primary">
                                {lesson.lesson}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          
                          {/* Assignments */}
                          {lesson.assignments.map((assignment) => {
                            const status = getAssignmentStatus(assignment);
                            const dueStatus = getDueStatus(assignment.dueDate);
                            
                            return (
                              <TableRow key={assignment.id} hover>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell>
                                  <Stack spacing={0.5}>
                                    <Typography variant="body2" fontWeight="500">
                                      {assignment.title}
                                    </Typography>
                                    {assignment.description && (
                                      <Typography variant="caption" color="textSecondary">
                                        {assignment.description.length > 60 
                                          ? `${assignment.description.substring(0, 60)}...` 
                                          : assignment.description}
                                      </Typography>
                                    )}
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    icon={status.icon}
                                    label={status.label}
                                    color={status.color}
                                    size="small"
                                    sx={{ 
                                      fontWeight: 'bold',
                                      minWidth: 90,
                                      '& .MuiChip-icon': { fontSize: 16 }
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    icon={dueStatus.icon}
                                    label={dueStatus.label}
                                    color={dueStatus.color}
                                    size="small"
                                    variant={dueStatus.color === 'default' ? 'outlined' : 'filled'}
                                    sx={{ 
                                      fontWeight: dueStatus.color !== 'default' ? 'bold' : 'normal',
                                      minWidth: 85
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </Collapse>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {assignments.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <AssignmentIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">No assignments found</Typography>
            <Typography variant="body2" color="textSecondary">You're all caught up for now!</Typography>
          </Box>
        )}
      </Paper>

      {/* Urgent Alert */}
      {overdueCount > 0 && (
        <Alert 
          severity="error" 
          icon={<WarningIcon />}
          sx={{ borderRadius: 3, mt: 3 }}
        >
          <AlertTitle sx={{ fontWeight: 'bold' }}>
            {overdueCount} Overdue Assignment{overdueCount > 1 ? 's' : ''}
          </AlertTitle>
          Please complete these assignments as soon as possible.
        </Alert>
      )}
    </Container>
  );
};

export default HomeworkList;
