import React, { useMemo, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Avatar,
  Divider,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Stack,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  AccessTime,
  EmojiEvents,
  TrendingUp,
  School,
  Download,
  Share,
  Stars,
  AutoGraph,
  ElectricBolt,
  Terminal,
  GridOn,
  Security,
  Hub,
  BlurOn,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import { useProgress } from '../../context/ProgressContext';
import { useAuth } from '../../context/AuthContext';
import { resolveAvatarSrc } from '../../utils/media';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const WeeklyReport = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const { progress = [], watchTimeStats, getQuizStats, loading } = useProgress();

  const quizStats = getQuizStats();

  // 1. Generate Heatmap Data (Simulated for 28 days)
  const heatmapData = useMemo(() => {
    const data = [];
    for (let i = 0; i < 28; i++) {
      data.push({
        day: i,
        intensity: Math.floor(Math.random() * 5), // 0 to 4
        date: new Date(Date.now() - (27 - i) * 24 * 60 * 60 * 1000).toLocaleDateString()
      });
    }
    return data;
  }, []);

  // 2. Skill Progress Data
  const skillData = useMemo(() => {
    const subjects = {};
    progress.forEach(p => {
      const sName = p.Content?.Topic?.Subject?.name || 'Logic';
      if (!subjects[sName]) subjects[sName] = { score: 0, count: 0 };
      subjects[sName].count += 1;
      if (p.completed) subjects[sName].score += 1;
    });
    return Object.keys(subjects).map(name => ({
      name,
      percent: Math.round((subjects[name].score / subjects[name].count) * 100) || 10
    })).slice(0, 4);
  }, [progress]);

  // 3. Chart Data
  const chartData = useMemo(() => ({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Watch Time (min)',
      data: watchTimeStats?.dailyStats?.slice(-7).map(d => d.minutes) || [0, 0, 0, 0, 0, 0, 0],
      borderColor: '#00f2ff',
      backgroundColor: alpha('#00f2ff', 0.1),
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#00f2ff',
      pointBorderColor: '#fff',
      pointHoverRadius: 8,
    }]
  }), [watchTimeStats]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" bgcolor="#020617">
      <CircularProgress sx={{ color: '#00f2ff' }} />
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#020617', minHeight: '100vh', py: 6, color: '#f8fafc', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(15, 23, 42, 1) 0%, rgba(2, 6, 23, 1) 100%)' }}>
      <Container maxWidth="xl">
        
        {/* TOP: HOLOGRAPHIC PROFILE */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} lg={4}>
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <Paper 
                sx={{ 
                  p: 4, 
                  borderRadius: 8, 
                  bgcolor: alpha('#0f172a', 0.6), 
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 242, 255, 0.2)',
                  boxShadow: '0 0 40px rgba(0, 242, 255, 0.1)',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, bgcolor: '#00f2ff', boxShadow: '0 0 20px #00f2ff' }} />
                <Avatar 
                  src={resolveAvatarSrc(user?.avatar)} 
                  sx={{ width: 120, height: 120, mx: 'auto', mb: 3, border: '4px solid #00f2ff', boxShadow: '0 0 30px rgba(0, 242, 255, 0.5)' }} 
                />
                <Typography variant="h4" fontWeight="900" sx={{ color: '#fff', textShadow: '0 0 10px rgba(0, 242, 255, 0.5)' }}>{user?.name}</Typography>
                <Typography variant="subtitle1" sx={{ color: '#00f2ff', fontWeight: 'bold', mb: 2 }}>OPERATIVE ID: #00{user?.id}</Typography>
                <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
                <Stack direction="row" justifyContent="center" spacing={3}>
                  <Box>
                    <Typography variant="h5" fontWeight="900" color="#fff">{user?.points || 0}</Typography>
                    <Typography variant="caption" color="textSecondary">XP EARNED</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="900" color="#fff">14</Typography>
                    <Typography variant="caption" color="textSecondary">DAY STREAK</Typography>
                  </Box>
                </Stack>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} lg={8}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="900" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <GridOn sx={{ color: '#00f2ff' }} /> Activity Pulse
                </Typography>
                <Chip label="ONLINE - SYNCING" size="small" sx={{ bgcolor: alpha('#22c55e', 0.1), color: '#22c55e', fontWeight: 'bold', border: '1px solid #22c55e' }} />
              </Box>
              
              {/* HEATMAP GRID */}
              <Paper sx={{ p: 4, borderRadius: 8, bgcolor: alpha('#0f172a', 0.4), border: '1px solid rgba(255,255,255,0.05)' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {heatmapData.map((d, i) => (
                    <Tooltip key={i} title={d.date} arrow>
                      <Box 
                        sx={{ 
                          width: { xs: 20, md: 30 }, 
                          height: { xs: 20, md: 30 }, 
                          borderRadius: 1, 
                          bgcolor: [
                            'rgba(255,255,255,0.05)', 
                            'rgba(0, 242, 255, 0.2)', 
                            'rgba(0, 242, 255, 0.5)', 
                            'rgba(0, 242, 255, 0.8)', 
                            '#00f2ff'
                          ][d.intensity],
                          boxShadow: d.intensity > 3 ? '0 0 10px #00f2ff' : 'none',
                          transition: 'all 0.2s',
                          '&:hover': { transform: 'scale(1.2)', zIndex: 1 }
                        }} 
                      />
                    </Tooltip>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, opacity: 0.6 }}>
                  <Typography variant="caption">LESS ACTIVE</Typography>
                  <Typography variant="caption">CRITICAL FOCUS</Typography>
                </Box>
              </Paper>

              <Grid container spacing={3} sx={{ mt: 2 }}>
                {[
                  { label: 'Network Latency', value: '4ms', color: '#22c55e', icon: <Hub /> },
                  { label: 'Security Level', value: 'SECURE', color: '#00f2ff', icon: <Security /> },
                  { label: 'Sync Progress', value: '84%', color: '#f59e0b', icon: <BlurOn /> }
                ].map((s, i) => (
                  <Grid item xs={4} key={i}>
                    <Paper sx={{ p: 2, borderRadius: 4, bgcolor: alpha('#0f172a', 0.4), border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                      <Box sx={{ color: s.color, mb: 0.5 }}>{s.icon}</Box>
                      <Typography variant="h6" fontWeight="900">{s.value}</Typography>
                      <Typography variant="caption" color="textSecondary">{s.label}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Grid>
        </Grid>

        {/* MIDDLE: CORE ANALYTICS */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 5, borderRadius: 8, bgcolor: alpha('#0f172a', 0.6), border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
              <Typography variant="h6" fontWeight="900" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoGraph sx={{ color: '#00f2ff' }} /> Real-time Performance Stream
              </Typography>
              <Box sx={{ height: 350, mt: 4 }}>
                <Line 
                  data={chartData} 
                  options={{ 
                    maintainAspectRatio: false, 
                    scales: { 
                      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)' } },
                      x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)' } }
                    },
                    plugins: { legend: { display: false } }
                  }} 
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 5, borderRadius: 8, bgcolor: alpha('#0f172a', 0.6), border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
              <Typography variant="h6" fontWeight="900" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ElectricBolt sx={{ color: '#f59e0b' }} /> Mastery Power-Ups
              </Typography>
              <Stack spacing={4} sx={{ mt: 4 }}>
                {skillData.map((skill, i) => (
                  <Box key={i}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                      <Typography variant="body2" fontWeight="bold">{skill.name}</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: '#00f2ff' }}>{skill.percent}%</Typography>
                    </Stack>
                    <Box sx={{ height: 10, width: '100%', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 5, position: 'relative', overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${skill.percent}%` }} 
                        transition={{ duration: 1, delay: i * 0.2 }}
                        style={{ height: '100%', backgroundColor: i % 2 === 0 ? '#00f2ff' : '#f43f5e', boxShadow: `0 0 10px ${i % 2 === 0 ? '#00f2ff' : '#f43f5e'}` }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* BOTTOM: SYSTEM LOG & ACTIONS */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4, borderRadius: 8, bgcolor: '#000', border: '1px solid rgba(0, 242, 255, 0.3)', fontFamily: 'monospace' }}>
              <Typography variant="h6" sx={{ color: '#00f2ff', mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Terminal /> MISSION_LOG_SYSTEM.EXE
              </Typography>
              <Box sx={{ height: 200, overflowY: 'auto', pr: 2, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#00f2ff' } }}>
                {[
                  `> [${new Date().toLocaleTimeString()}] System boot successful. Operative ${user?.name} authorized.`,
                  `> [${new Date().toLocaleTimeString()}] Fetching data for current session...`,
                  `> [PASS] Quiz accuracy detected at ${quizStats.averageScore}%. Optimal levels maintained.`,
                  `> [SYNC] Weekly watch time verified: ${Math.round((watchTimeStats?.totalWatchTime || 0) / 60)} minutes.`,
                  `> [ALERT] New badge "Code Master" is within 20% range of acquisition.`,
                  `> [EXEC] Recommendation: Review "Data Structures" module for immediate XP boost.`,
                  `> [EOF] End of current intelligence stream.`
                ].map((log, i) => (
                  <Typography key={i} variant="body2" sx={{ color: i === 4 ? '#f59e0b' : '#22c55e', mb: 1.5 }}>{log}</Typography>
                ))}
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Button 
                variant="contained" 
                fullWidth 
                startIcon={<Download />}
                sx={{ 
                  flex: 1, 
                  borderRadius: 4, 
                  bgcolor: '#00f2ff', 
                  color: '#000', 
                  fontWeight: 'bold', 
                  fontSize: '1.1rem',
                  '&:hover': { bgcolor: '#fff', boxShadow: '0 0 30px #00f2ff' }
                }}
              >
                EXTRACT DATA
              </Button>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<Share />}
                sx={{ 
                  flex: 1, 
                  borderRadius: 4, 
                  borderColor: '#00f2ff', 
                  color: '#000000', 
                  fontWeight: 'bold',
                  '&:hover': { borderColor: '#fff', color: '#fff', bgcolor: alpha('#00f2ff', 0.1) }
                }}
              >
                UPLINK TO COMMAND
              </Button>
            </Stack>
          </Grid>
        </Grid>

      </Container>
    </Box>
  );
};

export default WeeklyReport;
