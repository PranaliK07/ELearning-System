import React, { useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
  Collapse,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  AccessTime,
  EmojiEvents,
  TrendingUp,
  School,
  Download,
  Share,
  ExpandMore,
  ExpandLess,
  CalendarToday
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import TimeSpentChart from '../../components/charts/TimeSpentChart';
import ProgressChart from '../../components/charts/ProgressChart';

import { useProgress } from '../../context/ProgressContext';
import { useAuth } from '../../context/AuthContext';

const WeeklyReport = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expandedHighlights, setExpandedHighlights] = React.useState(!isMobile);
  const [expandedAchievements, setExpandedAchievements] = React.useState(!isMobile);

  const { user } = useAuth();
  const { progress = [], watchTimeStats, getQuizStats, loading } = useProgress();

  const quizStats = getQuizStats();

  const subjectData = useMemo(() => {
    const subjects = {};
    progress.forEach(p => {
      const sName = p.Content?.Topic?.Subject?.name || 'General';
      if (!subjects[sName]) subjects[sName] = { total: 0, completed: 0, time: 0 };
      subjects[sName].total += 1;
      if (p.completed) subjects[sName].completed += 1;
      subjects[sName].time += (p.watchTime || 0) / 3600; // rough hours approx from seconds
    });

    const labels = Object.keys(subjects);
    const data = labels.map(l => Math.max(0.1, Number(subjects[l].time.toFixed(1)))); // At least 0.1 for visibility
    
    // Find top subject
    let topSubject = 'General';
    let maxTime = -1;
    labels.forEach((l, i) => {
       if (data[i] > maxTime) {
           maxTime = data[i];
           topSubject = l;
       }
    });

    return {
      labels: labels.length ? labels : ['No Activity'],
      datasets: [
        {
          label: 'Hours Spent',
          data: labels.length ? data : [1],
          backgroundColor: [
            '#FF6B6B',
            '#4ECDC4',
            '#45B7D1',
            '#96CEB4',
            '#FFEAA7'
          ],
          borderWidth: 0
        }
      ],
      topSubject,
      topSubjectTime: maxTime > 0 ? maxTime : 0
    };
  }, [progress]);

  const weekData = useMemo(() => {
     let tTime = watchTimeStats?.totalWatchTime || 0; // minutes
     let dailys = [0, 0, 0, 0, 0, 0, 0];
     
     if (watchTimeStats?.dailyWatchTime && watchTimeStats.dailyWatchTime.length > 0) {
        const last7 = watchTimeStats.dailyWatchTime.slice(-7);
        dailys = last7.map(d => d.minutes);
     }

     return {
        totalWatchTime: tTime,
        avgWatchTime: Math.round(tTime / 7),
        completedLessons: progress.filter(p => p.completed).length,
        quizzesTaken: quizStats.totalTaken || 0,
        avgScore: quizStats.averageScore || 0,
        pointsEarned: user?.points || 0,
        topSubject: subjectData.topSubject,
        topSubjectTime: subjectData.topSubjectTime,
        dailyData: dailys,
        bestDayValue: Math.max(...dailys, 0)
     }
  }, [watchTimeStats, progress, quizStats, user, subjectData]);

  const achievements = user?.Achievements || [];

  const handleDownload = () => {
    // Implement PDF download
  };

  const handleShare = () => {
    // Implement share functionality
  };

  const statsCards = [
    { icon: AccessTime, value: `${weekData.totalWatchTime}`, unit: 'min', label: 'Total Time', color: 'primary.main' },
    { icon: School, value: weekData.completedLessons, unit: '', label: 'Lessons', color: 'success.main' },
    { icon: TrendingUp, value: `${weekData.avgScore}%`, unit: '', label: 'Avg Score', color: 'warning.main' },
    { icon: EmojiEvents, value: weekData.pointsEarned, unit: '', label: 'Points', color: 'info.main' }
  ];

  if (loading) {
     return (
       <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
         <CircularProgress />
       </Box>
     );
  }

  const currentDate = new Date();
  const weekStart = new Date();
  weekStart.setDate(currentDate.getDate() - 7);
  const dateString = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            gutterBottom 
            sx={{ 
              fontFamily: '"Comic Neue", cursive',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              fontWeight: 'bold'
            }}
          >
            Weekly Progress Report 📊
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              icon={<CalendarToday sx={{ fontSize: 16 }} />} 
              label={dateString} 
              size="small"
              variant="outlined"
              sx={{ mb: { xs: 1, sm: 0 } }}
            />
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Current Week Summary
            </Typography>
          </Box>
        </Box>

        {/* Stats Cards - Horizontal Scroll on Mobile */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          overflowX: isMobile ? 'auto' : 'visible',
          pb: isMobile ? 2 : 0,
          mb: { xs: 2, sm: 4 },
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            height: '4px'
          }
        }}>
          {statsCards.map((stat, index) => (
            <Card 
              key={index}
              sx={{ 
                flex: isMobile ? '0 0 auto' : 1,
                minWidth: isMobile ? 'calc(50% - 16px)' : 'auto',
                textAlign: 'center', 
                p: { xs: 1.5, sm: 2 },
                borderRadius: { xs: 2, sm: 3 }
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: stat.color, 
                  width: { xs: 40, sm: 48 }, 
                  height: { xs: 40, sm: 48 }, 
                  mx: 'auto', 
                  mb: 1 
                }}
              >
                <stat.icon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Avatar>
              <Typography 
                variant={isMobile ? "h6" : "h4"} 
                sx={{ 
                  color: stat.color,
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
                }}
              >
                {stat.value}
                {stat.unit && <Typography component="span" variant="caption" sx={{ ml: 0.5 }}>{stat.unit}</Typography>}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                {stat.label}
              </Typography>
            </Card>
          ))}
        </Box>

        {/* Charts Section */}
        <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: { xs: 2, sm: 4 } }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: { xs: 2, sm: 3, md: 4 } }}>
              <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
                Daily Watch Time
              </Typography>
              <Box sx={{ height: { xs: 200, sm: 250, md: 300 } }}>
                <TimeSpentChart data={weekData.dailyData} height={isMobile ? 200 : 300} />
              </Box>
              {isMobile && (
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                  Past 7 Days
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: { xs: 2, sm: 3, md: 4 } }}>
              <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
                Time per Subject
              </Typography>
              <Box sx={{ height: { xs: 180, sm: 200, md: 220 } }}>
                <ProgressChart type="doughnut" data={subjectData} height={isMobile ? 180 : 220} />
              </Box>
              <Box sx={{ mt: { xs: 1.5, sm: 2 }, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                {subjectData.labels.map((label, index) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                    <Box
                      sx={{
                        width: { xs: 8, sm: 10 },
                        height: { xs: 8, sm: 10 },
                        borderRadius: 2,
                        bgcolor: subjectData.datasets[0].backgroundColor[index],
                        mr: 1,
                        flexShrink: 0
                      }}
                    />
                    <Typography variant="body2" sx={{ flex: 1, fontSize: { xs: '0.7rem', sm: '0.75rem' } }} noWrap>
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, ml: 0.5 }}>
                      {subjectData.datasets[0].data[index]} hrs
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Achievements and Highlights - Collapsible on Mobile */}
        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: { xs: 2, sm: 3, md: 4 } }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: isMobile ? 'pointer' : 'default'
                }}
                onClick={() => isMobile && setExpandedAchievements(!expandedAchievements)}
              >
                <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
                  Achievements Unlocked 🏆
                </Typography>
                {isMobile && (
                  <IconButton size="small">
                    {expandedAchievements ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )}
              </Box>
              <Collapse in={!isMobile || expandedAchievements}>
                <List sx={{ pt: 0 }}>
                  {achievements.length > 0 ? achievements.map((achievement, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ px: { xs: 0, sm: 1 }, py: { xs: 1, sm: 1.5 } }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'warning.light' }}>
                            <Typography variant="h6">{achievement.icon || '🏆'}</Typography>
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {achievement.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="textSecondary">
                              {achievement.date ? new Date(achievement.date).toLocaleDateString() : 'Recently'}
                            </Typography>
                          }
                        />
                        <Chip
                          label={`+${achievement.points || 10}`}
                          size="small"
                          color="success"
                          sx={{ height: { xs: 24, sm: 32 }, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        />
                      </ListItem>
                      {index < achievements.length - 1 && <Divider />}
                    </React.Fragment>
                  )) : (
                     <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                        No achievements unlocked yet. Keep studying!
                     </Typography>
                  )}
                </List>
              </Collapse>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: { xs: 2, sm: 3, md: 4 } }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: isMobile ? 'pointer' : 'default'
                }}
                onClick={() => isMobile && setExpandedHighlights(!expandedHighlights)}
              >
                <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
                  Weekly Highlights ⭐
                </Typography>
                {isMobile && (
                  <IconButton size="small">
                    {expandedHighlights ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )}
              </Box>
              <Collapse in={!isMobile || expandedHighlights}>
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ 
                    mb: { xs: 2, sm: 2.5 }, 
                    p: { xs: 1.5, sm: 2 }, 
                    bgcolor: 'action.hover', 
                    borderRadius: 2 
                  }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      🌟 Best Day of Note
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      You studied for a peak of {weekData.bestDayValue} minutes on one of these days!
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    mb: { xs: 2, sm: 2.5 }, 
                    p: { xs: 1.5, sm: 2 }, 
                    bgcolor: 'action.hover', 
                    borderRadius: 2 
                  }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      📚 Favorite Subject: {weekData.topSubject !== 'No Activity' ? weekData.topSubject : 'None Yet'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {weekData.topSubject !== 'No Activity' ? `You've focused heavily on ${weekData.topSubject} recently.` : 'Start learning to discover your favorite subject!'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    p: { xs: 1.5, sm: 2 }, 
                    bgcolor: 'action.hover', 
                    borderRadius: 2 
                  }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      🏆 Overall Success Rate: {weekData.avgScore}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      You are maintaining a comprehensive quiz success rate around {weekData.avgScore}%.
                    </Typography>
                  </Box>
                </Box>
              </Collapse>
            </Paper>
          </Grid>
        </Grid>

        {/* Action Buttons - Sticky on Mobile */}
        <Box sx={{ 
          mt: { xs: 3, sm: 4 }, 
          mb: { xs: 2, sm: 0 },
          display: 'flex', 
          gap: { xs: 1.5, sm: 2 }, 
          justifyContent: 'center',
          flexDirection: isMobile ? 'column' : 'row',
          position: isMobile ? 'sticky' : 'static',
          bottom: isMobile ? 16 : 'auto',
          px: isMobile ? 2 : 0,
          zIndex: 100
        }}>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleDownload}
            fullWidth={isMobile}
            size={isMobile ? "medium" : "large"}
            sx={{ py: { xs: 1, sm: 1.5 } }}
          >
            Download Report
          </Button>
          <Button
            variant="outlined"
            startIcon={<Share />}
            onClick={handleShare}
            fullWidth={isMobile}
            size={isMobile ? "medium" : "large"}
            sx={{ py: { xs: 1, sm: 1.5 } }}
          >
            Share with Parents
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
};

export default WeeklyReport;
