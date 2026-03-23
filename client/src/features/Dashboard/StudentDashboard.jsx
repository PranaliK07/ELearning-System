import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  LinearProgress,
  Avatar,
  Chip,
  IconButton
} from '@mui/material';
import {
  PlayCircle,
  EmojiEvents,
  TrendingUp,
  Schedule,
  ChevronRight,
  Star,
  School
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';
import InstagramFeed from '../feed/InstagramFeed';
import axios from '../../utils/axios';


const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { watchTimeStats, getGradeProgress } = useProgress();
  const [recentActivities, setRecentActivities] = useState([]);
  const [recommendedContent, setRecommendedContent] = useState([]);
  const [achievements, setAchievements] = useState([]);

  async function fetchDashboardData() {
    try {
      const [activitiesRes, contentRes, achievementsRes] = await Promise.all([
        axios.get('/api/progress/recent', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/content/recommended', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/achievements/user', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setRecentActivities(activitiesRes.data);
      setRecommendedContent(contentRes.data);
      setAchievements(achievementsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const gradeProgress = getGradeProgress(user?.grade);

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.name}! 👋
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Ready to continue your learning journey?
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Card sx={{ borderRadius: 4, bgcolor: 'primary.light', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6">Class</Typography>
                      <Typography variant="h3">{user?.grade || 'Not Set'}</Typography>
                    </Box>
                    <School sx={{ fontSize: 48, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Card sx={{ borderRadius: 4, bgcolor: 'success.light', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6">Progress</Typography>
                      <Typography variant="h3">{gradeProgress}%</Typography>
                    </Box>
                    <TrendingUp sx={{ fontSize: 48, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Card sx={{ borderRadius: 4, bgcolor: 'warning.light', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6">Watch Time</Typography>
                      <Typography variant="h3">
                        {Math.round((watchTimeStats?.totalWatchTime || 0) / 60)}h
                      </Typography>
                    </Box>
                    <Schedule sx={{ fontSize: 48, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Card sx={{ borderRadius: 4, bgcolor: 'info.light', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6">Points</Typography>
                      <Typography variant="h3">{user?.points || 0}</Typography>
                    </Box>
                    <Star sx={{ fontSize: 48, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Instagram Feed Section */}
        <Box sx={{ mb: 6 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <PlayCircle color="primary" /> Latest Lessons for You
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/feed')}
              sx={{ borderRadius: 5 }}
            >
              Full Screen Feed
            </Button>
          </Box>
          <InstagramFeed />
        </Box>

        {/* Continue Watching */}
        <Paper sx={{ p: 3, borderRadius: 4, mb: 4 }}>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">Continue Watching</Typography>
            <Button endIcon={<ChevronRight />} onClick={() => navigate('/progress')}>
              View All
            </Button>
          </Box>

          <Grid container spacing={2}>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <Grid item xs={12} sm={6} md={4} key={activity.id}>
                  <Card sx={{ display: 'flex', borderRadius: 3 }}>
                    <CardMedia
                      component="img"
                      sx={{ width: 100, height: 100 }}
                      image={activity.Content?.thumbnail || `https://source.unsplash.com/random/100x100?education&sig=${activity.id}`}
                      alt="Video thumbnail"
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 1 }}>
                      <Typography variant="subtitle2" noWrap>
                        {activity.Content?.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Progress: {activity.progress}%
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={activity.progress}
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                      </Box>
                      <Box display="flex" justifyContent="flex-end" mt={1}>
                        <IconButton size="small" color="primary" onClick={() => navigate(`/play/video/${activity.Content?.id}`)}>
                          <PlayCircle />
                        </IconButton>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))
            ) : (
              <Box sx={{ p: 4, textAlign: 'center', width: '100%' }}>
                <Typography color="textSecondary">Your recent activity will appear here once you start learning! 🚀</Typography>
              </Box>
            )}
          </Grid>

        </Paper>

        {/* Recommended Content */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h5" gutterBottom>
                Recommended for You
              </Typography>

              <Grid container spacing={2}>
                {recommendedContent.length > 0 ? (
                  recommendedContent.map((item) => (
                    <Grid item xs={12} sm={6} key={item.id}>
                      <Card sx={{ borderRadius: 3 }}>
                        <CardMedia
                          component="img"
                          height="140"
                          image={item.thumbnail || `https://source.unsplash.com/random/300x140?kids&sig=${item.id}`}
                          alt="Content thumbnail"
                        />
                        <CardContent>
                          <Typography variant="h6" gutterBottom noWrap>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" paragraph sx={{ height: 40, overflow: 'hidden' }}>
                            {item.description}
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Chip
                              label={`${item.duration || 0} min`}
                              size="small"
                              icon={<Schedule />}
                              variant="outlined"
                            />
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => navigate(`/play/video/${item.id}`)}
                            >
                              Start
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center', width: '100%' }}>
                    <Typography color="textSecondary">No recommendations yet. Start by exploring courses! 📚</Typography>
                  </Box>
                )}
              </Grid>

            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h5" gutterBottom>
                Recent Achievements
              </Typography>

              <Box sx={{ mt: 2 }}>
                {achievements.length > 0 ? (
                  achievements.map((achievement) => (
                    <Box
                      key={achievement.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        mb: 1,
                        bgcolor: 'background.default',
                        borderRadius: 3
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                        <EmojiEvents />
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="subtitle2">{achievement.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {achievement.description}
                        </Typography>
                      </Box>
                      <Chip label={`+${achievement.points} pts`} size="small" color="success" />
                    </Box>
                  ))
                ) : (
                  <Box textAlign="center" py={2}>
                    <Typography variant="body2" color="textSecondary">No achievements yet. Keep learning! 🏆</Typography>
                  </Box>
                )}
              </Box>


              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => navigate('/achievements')}
              >
                View All Achievements
              </Button>
            </Paper>

            {/* Quick Actions */}
            <Paper sx={{ p: 3, borderRadius: 4, mt: 3 }}>
              <Typography variant="h5" gutterBottom>
                Quick Actions
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mb: 2, py: 1.5 }}
                  onClick={() => navigate('/study')}
                >
                  📚 Continue Studying
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 2, py: 1.5 }}
                  onClick={() => navigate('/quiz/1/start')}
                >
                  📝 Take a Quiz
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ py: 1.5 }}
                  onClick={() => navigate('/progress')}
                >
                  📊 View Progress
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default StudentDashboard;
