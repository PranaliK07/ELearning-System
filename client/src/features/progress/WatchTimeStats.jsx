import React, { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Button,
  CircularProgress,
  IconButton,
  Stack,
} from '@mui/material';
import {
  AccessTime,
  EmojiEvents,
  TrendingUp,
  Star,
  PlayCircle,
  ChevronRight,
  CheckCircle,
  Assignment,
  Schedule,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '../../context/ProgressContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import { formatTime } from '../../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  Filler
);

const formatChartDate = (date, isCompact = false) => {
  const value = new Date(date);
  return new Intl.DateTimeFormat('en-US', isCompact
    ? { weekday: 'short' }
    : { weekday: 'short', month: 'short', day: 'numeric' }).format(value);
};

const formatActivityDate = (date) => {
  const value = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(value);
};

  const WatchTimeStats = () => {
  const { progress = [], watchTimeStats, loading, refreshStats, getQuizStats } = useProgress();
  const { user } = useAuth();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [assignmentStats, setAssignmentStats] = useState({ completed: 0, total: 0 });
  
  const navy = theme.palette.primary.main;
  const pink = theme.palette.secondary.main;
  const pageBg = theme.palette.background.default;
  const surface = theme.palette.background.paper;
  const cardBorder = theme.palette.divider;
  const cardShadow = isDarkMode ? '0 16px 40px rgba(0, 0, 0, 0.28)' : '0 16px 40px rgba(11, 31, 59, 0.06)';
  const masteryRingSize = isMobile ? 148 : 176;
  const quizStats = getQuizStats();
  const totalLessons = progress.length;
  const completedLessons = useMemo(() => progress.filter(p => p.completed).length, [progress]);
  const attendancePresent = useMemo(
    () => attendanceRecords.filter(r => r.status === 'present').length,
    [attendanceRecords]
  );
  const attendanceRate = attendanceRecords.length
    ? Math.round((attendancePresent / attendanceRecords.length) * 100)
    : 0;
  const assignmentRate = assignmentStats.total
    ? Math.round((assignmentStats.completed / assignmentStats.total) * 100)
    : 0;
  const firstName = user?.name?.split(' ')?.[0] || 'Student';

  useEffect(() => {
    refreshStats();
    fetchAttendance();
    fetchAssignments();
  }, [refreshStats]);

  const fetchAttendance = async () => {
    try {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      const res = await api.get('/api/attendance/me', { 
        params: { from: d.toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) } 
      });
      const list = Array.isArray(res.data?.attendance) ? res.data.attendance : [];
      setAttendanceRecords(list);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/api/assignments');
      const assignments = res.data || [];
      const total = assignments.length;
      const completed = assignments.filter(a => a.Submissions && a.Submissions.length > 0).length;
      setAssignmentStats({ completed, total });
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  const chartData = useMemo(() => {
    if (!watchTimeStats?.dailyWatchTime?.length) return null;

    const dates = watchTimeStats.dailyWatchTime.map((entry) =>
      formatChartDate(entry.date, isMobile)
    );
    const minutes = watchTimeStats.dailyWatchTime.map((entry) => entry.minutes || 0);

    return {
      labels: dates,
      datasets: [
        {
          label: 'Learning Minutes',
          data: minutes,
          borderColor: pink,
          backgroundColor: alpha(pink, 0.12),
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: pink,
          pointBorderColor: theme.palette.background.paper,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [watchTimeStats, isMobile]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: alpha(theme.palette.divider, isDarkMode ? 0.9 : 0.55) },
        ticks: {
          color: theme.palette.text.secondary,
          font: { size: 11 },
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: theme.palette.text.secondary,
          font: { size: 11 },
        },
      },
    },
  }), [theme]);

  const subjectProgress = useMemo(() => {
    const subjects = {};
    progress.forEach(p => {
      const sName = p.Content?.Topic?.Subject?.name || 'General';
      if (!subjects[sName]) subjects[sName] = { total: 0, completed: 0 };
      subjects[sName].total += 1;
      if (p.completed) subjects[sName].completed += 1;
    });

    const entries = Object.entries(subjects)
      .map(([name, stats], index) => ({
        name,
        total: stats.total,
        completed: stats.completed,
        percent: stats.total ? Math.round((stats.completed / stats.total) * 100) : 0,
        color: [pink, '#4ECDC4', '#45B7D1', navy, '#FFEAA7', '#6C5CE7', '#FF9F43'][index % 7],
      }))
      .sort((a, b) => b.percent - a.percent || b.total - a.total);

    return {
      entries,
      labels: entries.map(entry => entry.name),
      datasets: [{
        data: entries.map(entry => entry.percent),
        backgroundColor: entries.map(entry => entry.color),
        borderWidth: 0,
        borderRadius: 8,
        hoverOffset: 10
      }],
    };
  }, [progress]);

  const averageSubjectProgress = useMemo(() => {
    if (!subjectProgress.entries.length) return 0;
    return Math.round(
      subjectProgress.entries.reduce((sum, item) => sum + item.percent, 0) /
      subjectProgress.entries.length
    );
  }, [subjectProgress.entries]);

  const overallProgressData = useMemo(() => {
    const components = [];

    if (totalLessons > 0) {
      components.push({
        value: Math.round((completedLessons / totalLessons) * 100),
        weight: 0.4,
      });
    }

    if (quizStats.totalTaken > 0) {
      components.push({ value: quizStats.averageScore, weight: 0.25 });
    }

    if (attendanceRecords.length > 0) {
      components.push({ value: attendanceRate, weight: 0.2 });
    }

    if (assignmentStats.total > 0) {
      components.push({ value: assignmentRate, weight: 0.15 });
    }

    if (!components.length) return 0;

    const totalWeight = components.reduce((sum, item) => sum + item.weight, 0);
    const blendedScore =
      components.reduce((sum, item) => sum + item.value * item.weight, 0) / totalWeight;

    return Math.round(Math.min(100, blendedScore));
  }, [
    totalLessons,
    completedLessons,
    quizStats.totalTaken,
    quizStats.averageScore,
    attendanceRecords.length,
    attendanceRate,
    assignmentStats.total,
    assignmentRate,
  ]);

  const recentActivities = useMemo(() => {
    return [...progress]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
      .map(p => ({
        id: p.ContentId,
        title: p.Content?.title || 'Lesson',
        time: formatActivityDate(p.updatedAt),
        subject: p.Content?.Topic?.Subject?.name || 'General',
        completed: p.completed,
        percentCompleted: p.percentCompleted || 0,
      }));
  }, [progress]);

  const inProgressLessons = useMemo(() => {
    return progress.filter(p => !p.completed && p.percentCompleted > 0)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 3);
  }, [progress]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <CircularProgress size={60} thickness={4} sx={{ color: pink }} />
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100%', background: pageBg, py: { xs: 3, md: 5 } }}>
      <Container maxWidth="xl">
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Chip
                  label="Student progress overview"
                  size="small"
                  sx={{
                    mb: 1.5,
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    bgcolor: alpha(navy, isDarkMode ? 0.18 : 0.08),
                    color: navy,
                  }}
                />
                <Typography variant="h3" fontWeight="900" sx={{ color: 'text.primary', mb: 1, fontFamily: '"Outfit", sans-serif' }}>
                  Progress Report
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760, lineHeight: 1.7 }}>
                  A clear view of your learning momentum, subject mastery, and the lessons you can continue next.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Chip
                  icon={<Star sx={{ color: '#FFD700 !important' }} />}
                  label={`${user?.points || 0} Points`}
                  sx={{ bgcolor: alpha(navy, 0.05), fontWeight: 700, height: 40, px: 1 }}
                />
                <Chip
                  label={`${completedLessons}/${totalLessons} Lessons`}
                  variant="outlined"
                  sx={{ fontWeight: 700, height: 40 }}
                />
              </Stack>
            </Box>

            <Grid container spacing={3}>
              {/* Main Progress Highlight */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, md: 4 },
                    borderRadius: 5,
                    overflow: 'hidden',
                    background: surface,
                    border: '1px solid',
                    borderColor: cardBorder,
                    boxShadow: cardShadow,
                    height: '100%',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(180deg, ${alpha(navy, isDarkMode ? 0.1 : 0.02)} 0%, transparent 45%)`,
                      pointerEvents: 'none',
                    }}
                  />
                  <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ textAlign: 'center', width: '100%' }}>
                      <Typography variant="h6" fontWeight="900" sx={{ color: navy, mb: 0.75 }}>
                        Your learning status is moving steadily
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        This summary blends lesson completion, quiz performance, attendance, and assignments.
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Stack
                        spacing={1.25}
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                          minHeight: masteryRingSize + 56,
                          width: '100%',
                          textAlign: 'center',
                        }}
                      >
                        <Box
                          sx={{
                            position: 'relative',
                            width: masteryRingSize,
                            height: masteryRingSize,
                            mx: 'auto',
                          }}
                        >
                          <CircularProgress
                            variant="determinate"
                            value={100}
                            size={masteryRingSize}
                            thickness={4}
                            sx={{ color: alpha(navy, isDarkMode ? 0.25 : 0.08), position: 'absolute', left: 0, top: 0 }}
                          />
                          <CircularProgress
                            variant="determinate"
                            value={overallProgressData}
                            size={masteryRingSize}
                            thickness={4.5}
                            sx={{
                              color: pink,
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              '& .MuiCircularProgress-circle': {
                                strokeLinecap: 'round',
                              },
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                            }}
                          >
                          <Typography variant={isMobile ? 'h3' : 'h2'} fontWeight="900" sx={{ color: 'text.primary', lineHeight: 1 }}>
                              {overallProgressData}%
                          </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                            Overall mastery
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Combined from lessons, quizzes, attendance, and assignments
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.25 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                          Mastery progress
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                          {overallProgressData}/100
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={overallProgressData}
                        sx={{
                          height: 10,
                          borderRadius: 999,
                          bgcolor: alpha(navy, isDarkMode ? 0.18 : 0.06),
                          '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${pink} 0%, #FF6FA3 100%)`,
                          },
                        }}
                      />
                    </Box>

                    <Grid container spacing={1.5} justifyContent="center">
                      <Grid item xs={6} sm={3}>
                        <MasteryDetail label="Attendance" value={`${attendanceRate}%`} />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <MasteryDetail label="Quiz average" value={`${quizStats.averageScore}%`} />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <MasteryDetail label="Assignments" value={`${assignmentStats.completed}/${assignmentStats.total} (${assignmentRate}%)`} />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <MasteryDetail label="Watch time" value={formatTime(watchTimeStats?.totalWatchTime || 0)} />
                      </Grid>
                    </Grid>
                  </Stack>
                </Paper>
              </Grid>

            {/* Recent Activity */}
            <Grid item xs={12}>
              <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: cardBorder, boxShadow: cardShadow, bgcolor: surface }}>
                <Typography variant="h6" fontWeight="800" sx={{ color: 'text.primary', mb: 3 }}>Recent Activity Feed</Typography>
                <List disablePadding>
                  {recentActivities.length > 0 ? recentActivities.map((activity, idx) => (
                    <motion.div key={activity.id} whileHover={{ x: 10 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <ListItem sx={{ px: 0, py: 2 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: alpha(navy, 0.05), color: navy, width: 48, height: 48 }}>
                            <PlayCircle sx={{ fontSize: 28 }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography variant="subtitle1" fontWeight="700">{activity.title}</Typography>}
                          secondary={<Typography variant="caption" color="text.secondary" fontWeight="600">{activity.time} | {activity.subject} | {activity.percentCompleted}% complete</Typography>}
                        />
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Chip 
                            label={activity.completed ? 'Finished' : 'In progress'} 
                            size="small" 
                            sx={{ 
                              borderRadius: 2, 
                              fontWeight: 700,
                              bgcolor: activity.completed ? alpha('#4ECDC4', 0.1) : alpha(pink, 0.1),
                              color: activity.completed ? '#2e7d32' : pink
                            }}
                          />
                          <IconButton onClick={() => window.location.href=`/play/video/${activity.id}`}>
                            <ChevronRight />
                          </IconButton>
                        </Stack>
                      </ListItem>
                      {idx < recentActivities.length - 1 && <Divider sx={{ opacity: 0.6 }} />}
                    </motion.div>
                  )) : (
                    <Typography variant="body2" color="text.secondary">
                      No recent activity yet.
                    </Typography>
                  )}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: cardBorder, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: cardShadow, bgcolor: surface }}>
                <Typography variant="h6" fontWeight="900" sx={{ color: 'text.primary', mb: 1 }}>Subject Mastery</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  A quick breakdown of completion by subject.
                </Typography>
                <Box sx={{ height: 220, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                  {subjectProgress.entries.length > 0 ? (
                    <>
                      <Doughnut data={subjectProgress} options={{ cutout: '78%', plugins: { legend: { display: false } } }} />
                      <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="900" sx={{ color: 'text.primary' }}>{averageSubjectProgress}%</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight="600">Average mastery</Typography>
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                      <Typography variant="subtitle2" fontWeight="700" sx={{ color: 'text.primary' }}>No subject data yet</Typography>
                      <Typography variant="caption" color="text.secondary">Start a lesson to see subject progress here.</Typography>
                    </Box>
                  )}
                </Box>
                <Box sx={{ overflowY: 'auto', flex: 1, pr: 0.5 }}>
                  <Stack spacing={2}>
                    {subjectProgress.entries.length > 0 ? subjectProgress.entries.map((entry) => (
                      <Box key={entry.name}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75, gap: 1 }}>
                          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: entry.color, flexShrink: 0 }} />
                            <Typography variant="body2" fontWeight="700" color="text.secondary" noWrap>
                              {entry.name}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" fontWeight="900" sx={{ color: 'text.primary' }}>
                            {entry.percent}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={entry.percent}
                          sx={{
                            height: 8,
                            borderRadius: 999,
                            bgcolor: alpha(entry.color, 0.1),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: entry.color,
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {entry.completed}/{entry.total} lessons completed
                        </Typography>
                      </Box>
                    )) : (
                      <Typography variant="body2" color="text.secondary">
                        No subject breakdown available yet.
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Paper>
            </Grid>

              {/* Stats Cards */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, minmax(0, 1fr))',
                      lg: 'repeat(4, minmax(0, 1fr))',
                    },
                    justifyItems: {
                      xs: 'center',
                      sm: 'stretch',
                    },
                    alignItems: 'stretch',
                  }}
                >
                  <Box sx={{ minWidth: 0, width: '100%', maxWidth: { xs: 340, sm: 'none' } }}>
                    <StatCard icon={AccessTime} value={formatTime(watchTimeStats?.totalWatchTime || 0)} label="Time Spent" color={navy} delay={0.1} />
                  </Box>
                  <Box sx={{ minWidth: 0, width: '100%', maxWidth: { xs: 340, sm: 'none' } }}>
                    <StatCard icon={EmojiEvents} value={`${quizStats.averageScore}`} label="Quiz Average" color={pink} delay={0.2} progress={quizStats.averageScore || 0} />
                  </Box>
                  <Box sx={{ minWidth: 0, width: '100%', maxWidth: { xs: 340, sm: 'none' } }}>
                    <StatCard icon={Assignment} value={`${assignmentStats.completed}/${assignmentStats.total}`} label="Assignments" color="#4ECDC4" delay={0.3} progress={assignmentRate} compactOnMobile />
                  </Box>
                  <Box sx={{ minWidth: 0, width: '100%', maxWidth: { xs: 340, sm: 'none' } }}>
                    <StatCard icon={CheckCircle} value={`${attendancePresent}`} label="Days Present" color="#6C5CE7" delay={0.4} progress={attendanceRate} compactOnMobile />
                  </Box>
                </Box>
              </Grid>
          </Grid>
          </motion.div>
        </AnimatePresence>
      </Container>
    </Box>
  );
};

const MasteryDetail = ({ label, value }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 3,
        bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.18 : 0.06),
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, isDarkMode ? 0.24 : 0.12),
      }}
    >
      <Typography variant="caption" sx={{ opacity: 0.75, display: 'block', mb: 0.5, fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.25 }}>
        {value}
      </Typography>
    </Box>
  );
};

const StatCard = ({ icon: Icon, value, label, color, delay, progress, compactOnMobile = false }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, duration: 0.4 }}>
      <Paper
        sx={{
          height: '100%',
          minHeight: 180,
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha(color, 0.12),
          background: `linear-gradient(180deg, ${alpha(color, isDarkMode ? 0.08 : 0.03)} 0%, ${theme.palette.background.paper} 28%)`,
          boxShadow: isDarkMode ? '0 14px 32px rgba(0, 0, 0, 0.28)' : '0 14px 32px rgba(11, 31, 59, 0.06)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 18px 36px ${alpha(color, 0.12)}`,
            borderColor: alpha(color, 0.2),
          },
        }}
      >
        <Box sx={{ height: 4, bgcolor: color }} />
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={1.75}>
            <Stack
              direction={compactOnMobile ? { xs: 'column', sm: 'row' } : 'row'}
              alignItems={compactOnMobile ? { xs: 'flex-start', sm: 'center' } : 'center'}
              justifyContent="space-between"
              spacing={compactOnMobile ? { xs: 1, sm: 0 } : 0}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, width: compactOnMobile ? { xs: '100%', sm: 'auto' } : 'auto' }}>
                <Box
                  sx={{
                    width: { xs: 42, sm: 46 },
                    height: { xs: 42, sm: 46 },
                    borderRadius: 3,
                    bgcolor: alpha(color, 0.1),
                    color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid',
                    borderColor: alpha(color, 0.14),
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ fontSize: 24 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase', display: 'block', fontSize: { xs: '0.66rem', sm: '0.72rem' } }}>
                    {label}
                  </Typography>
                  <Typography variant="h5" fontWeight="900" sx={{ color, lineHeight: 1.1, fontSize: { xs: '1.45rem', sm: '1.8rem' } }}>
                    {value}
                  </Typography>
                </Box>
              </Box>
              {typeof progress === 'number' && (
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color,
                    bgcolor: alpha(color, 0.08),
                    px: 1.1,
                    py: 0.5,
                    borderRadius: 999,
                    flexShrink: 0,
                    alignSelf: compactOnMobile ? { xs: 'flex-start', sm: 'center' } : 'center',
                  }}
                >
                  {progress}%
                </Typography>
              )}
            </Stack>
            {typeof progress === 'number' && (
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 7,
                  borderRadius: 999,
                  bgcolor: alpha(color, 0.08),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: color,
                  },
                }}
              />
            )}
          </Stack>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default WatchTimeStats;
