import React, { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  LinearProgress,
  Chip,
  useTheme,
  alpha,
  Button,
  CircularProgress,
  Stack,
  Avatar,
} from '@mui/material';
import {
  EmojiEvents,
  CheckCircle,
  AccessTime,
  Refresh,
  PlayArrow,
  Assignment,
  Description,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useProgress } from '../../context/ProgressContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import { formatTime } from '../../utils/helpers';
import { resolveAvatarSrc } from '../../utils/media';

import Reports from '../teacher/Reports';

const WatchTimeStats = () => {
  const { progress = [], watchTimeStats, loading, refreshStats, getQuizStats } = useProgress();
  const { user } = useAuth();
  const theme = useTheme();

  // If teacher or admin, show students progress (Reports)
  if (user?.role === 'teacher' || user?.role === 'admin') {
    return <Reports />;
  }
  
  const BRAND_NAVY = '#D18AC4';
  const quizStats = getQuizStats();

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [assignmentStats, setAssignmentStats] = useState({ completed: 0, total: 0 });

  useEffect(() => {
    refreshStats();
    // Only fetch student-specific data if the user is a student
    if (user?.role === 'student') {
      fetchAttendance();
      fetchAssignments();
    }
  }, [refreshStats, user?.role]);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/api/attendance/me');
      setAttendanceRecords(Array.isArray(res.data?.attendance) ? res.data.attendance : []);
    } catch (err) { 
      console.error('Error fetching attendance:', err); 
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/api/assignments');
      const assignments = res.data || [];
      const total = assignments.length;
      const completed = assignments.filter((a) => a.Submissions && a.Submissions.length > 0).length;
      setAssignmentStats({ completed, total });
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  // CALCULATE REAL PERCENTAGES
  const statsPercents = useMemo(() => {
    // 1. Attendance %
    const totalAttendanceDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
    const attendancePct = totalAttendanceDays > 0 ? Math.round((presentDays / totalAttendanceDays) * 100) : 0;

    // 2. Homework %
    const homeworkPct = assignmentStats.total > 0 ? Math.round((assignmentStats.completed / assignmentStats.total) * 100) : 0;

    // 3. Watch Time %
    // Use totalPossibleTime from backend if available, otherwise fallback to progress records
    const totalPossibleSeconds = watchTimeStats?.totalPossibleTime || 0;
    const totalWatchedSeconds = watchTimeStats?.totalWatchTime || 0;
    const watchTimePct = totalPossibleSeconds > 0 ? Math.round((totalWatchedSeconds / totalPossibleSeconds) * 100) : 0;

    // 4. Notes %
    const readingMaterials = progress.filter(p => p.Content?.type === 'reading');
    const notesDownloaded = progress.filter(p => p.notesDownloaded).length;
    const notesPct = readingMaterials.length > 0 ? Math.round((notesDownloaded / readingMaterials.length) * 100) : 0;

    return {
      attendance: attendancePct,
      homework: homeworkPct,
      watchTime: Math.min(100, watchTimePct),
      notes: notesPct,
      quiz: quizStats.averageScore
    };
  }, [attendanceRecords, assignmentStats, progress, watchTimeStats, quizStats]);

  // BLENDED OVERALL PROGRESS (REAL AVERAGE)
  const blendedOverallProgress = useMemo(() => {
    const { attendance, homework, watchTime, notes, quiz } = statsPercents;
    const metrics = [
      { val: attendance, weight: 1 },
      { val: quiz, weight: 1 },
      { val: watchTime, weight: 1 },
      { val: homework, weight: 1 },
      { val: notes, weight: 1 }
    ];
    const weightedSum = metrics.reduce((sum, m) => sum + m.val, 0);
    return Math.round(weightedSum / metrics.length);
  }, [statsPercents]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress sx={{ color: BRAND_NAVY }} />
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        
        {/* SIMPLE HEADER */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Avatar 
            src={resolveAvatarSrc(user?.avatar)} 
            sx={{ width: 80, height: 80, mx: 'auto', mb: 2, border: `3px solid ${BRAND_NAVY}` }} 
          />
          <Typography variant="h4" fontWeight="800" gutterBottom>
            My Learning Progress
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Your real blended performance average
          </Typography>
        </Box>

        {/* MAIN PROGRESS CIRCLE */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 6, 
            borderRadius: 8, 
            bgcolor: alpha(BRAND_NAVY, 0.03), 
            textAlign: 'center',
            border: `2px solid ${alpha(BRAND_NAVY, 0.05)}`,
            mb: 4
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={180}
              thickness={4}
              sx={{ color: alpha(BRAND_NAVY, 0.1) }}
            />
            <CircularProgress
              variant="determinate"
              value={blendedOverallProgress}
              size={180}
              thickness={4}
              sx={{ 
                color: BRAND_NAVY, 
                position: 'absolute', 
                left: 0,
                '& .MuiCircularProgress-circle': { strokeLinecap: 'round' }
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h3" fontWeight="900" color={BRAND_NAVY}>
                {blendedOverallProgress}%
              </Typography>
            </Box>
          </Box>
          <Typography variant="h5" fontWeight="700">
            Your Progress
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Average of attendance, quizzes, watch time, homework, and notes.
          </Typography>
        </Paper>

        {/* STATS GRID */}
        <Grid container spacing={2} sx={{ mb: 6 }}>
          {[
            { label: 'Attendance', value: `${statsPercents.attendance}%`, icon: <CheckCircle />, color: '#B66DC4' },
            { label: 'Quiz Score', value: `${statsPercents.quiz}%`, icon: <EmojiEvents />, color: '#eab308' },
            { 
              label: 'Watch Time', 
              value: (() => {
                const totalSec = watchTimeStats?.totalWatchTime || 0;
                const m = Math.floor(totalSec / 60);
                const s = totalSec % 60;
                return `${Math.round(statsPercents.watchTime)}% (${m > 0 ? `${m}m ` : ''}${s}s)`;
              })(), 
              icon: <AccessTime />, 
              color: '#6366f1' 
            },
            { label: 'Homework', value: `${statsPercents.homework}%`, icon: <Assignment />, color: '#f43f5e' },
            { label: 'Notes Saved', value: `${statsPercents.notes}%`, icon: <Description />, color: '#0ea5e9' },
          ].map((stat, i) => (
            <Grid item xs={6} sm={4} md={2.4} key={i}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #f1f5f9', height: '100%' }}>
                <Box sx={{ color: stat.color, mb: 1, display: 'flex', justifyContent: 'center' }}>{stat.icon}</Box>
                <Typography variant="h6" fontWeight="900">{stat.value}</Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontWeight: 'bold' }}>{stat.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* ACTION BUTTONS */}
        <Stack spacing={2}>
          <Button 
            variant="contained" 
            size="large" 
            fullWidth
            startIcon={<PlayArrow />}
            sx={{ 
              bgcolor: BRAND_NAVY, 
              py: 2, 
              borderRadius: 4, 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#1e293b' }
            }}
          >
            Continue Learning
          </Button>
          <Button 
            variant="text" 
            onClick={() => { refreshStats(); if (user?.role === 'student') { fetchAttendance(); fetchAssignments(); } }}
            startIcon={<Refresh />}
            sx={{ color: 'text.secondary' }}
          >
            Update All Stats
          </Button>
        </Stack>

      </Container>
    </Box>
  );
};

export default WatchTimeStats;
