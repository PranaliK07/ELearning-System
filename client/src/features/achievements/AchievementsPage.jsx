import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Avatar,
  Tabs,
  Tab
} from '@mui/material';
import {
  EmojiEvents,
  Lock,
  Star,
  TrendingUp,
  Schedule,
  School
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

const AchievementsPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const [allRes, userRes] = await Promise.all([
        axios.get('/api/achievements', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/achievements/user', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setAchievements(allRes.data);
      setUserAchievements(userRes.data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const isAchievementEarned = (achievementId) => {
    return userAchievements.some(a => a.id === achievementId);
  };

  const getProgress = (criteria) => {
    // Calculate progress based on criteria
    return Math.random() * 100; // Placeholder
  };

  const achievementsList = tabValue === 0 
    ? achievements 
    : achievements.filter(a => !isAchievementEarned(a.id));

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontFamily: '"Comic Neue", cursive',
              fontWeight: 'bold',
              color: 'primary.main'
            }}
          >
            Your Achievements 🏆
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Track your progress and earn badges
          </Typography>
        </Box>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, borderRadius: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                <EmojiEvents />
              </Avatar>
              <Typography variant="h4">{userAchievements.length}</Typography>
              <Typography variant="body2" color="textSecondary">
                Achievements Earned
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, borderRadius: 3 }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
                <Star />
              </Avatar>
              <Typography variant="h4">
                {userAchievements.reduce((sum, a) => sum + a.points, 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Points
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, borderRadius: 3 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2 }}>
                <TrendingUp />
              </Avatar>
              <Typography variant="h4">
                {Math.round((userAchievements.length / achievements.length) * 100)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Completion Rate
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, borderRadius: 3 }}>
              <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 2 }}>
                <School />
              </Avatar>
              <Typography variant="h4">{achievements.length}</Typography>
              <Typography variant="body2" color="textSecondary">
                Total Achievements
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="All Achievements" />
            <Tab label="In Progress" />
          </Tabs>
        </Box>

        {/* Achievements Grid */}
        <Grid container spacing={3}>
          {achievementsList.map((achievement, index) => {
            const earned = isAchievementEarned(achievement.id);
            const progress = earned ? 100 : getProgress(achievement.criteria);

            return (
              <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      borderRadius: 3,
                      position: 'relative',
                      opacity: earned ? 1 : 0.7,
                      '&:hover': {
                        transform: 'scale(1.02)',
                        transition: 'transform 0.2s'
                      }
                    }}
                  >
                    {earned && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          zIndex: 1
                        }}
                      >
                        <Chip
                          icon={<EmojiEvents />}
                          label="Earned!"
                          color="success"
                          size="small"
                        />
                      </Box>
                    )}

                    {!earned && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          zIndex: 1
                        }}
                      >
                        <Chip
                          icon={<Lock />}
                          label="Locked"
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    )}

                    <CardContent sx={{ textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          mx: 'auto',
                          mb: 2,
                          bgcolor: earned ? 'warning.main' : 'grey.400',
                          fontSize: '2rem'
                        }}
                      >
                        {achievement.icon || '🏆'}
                      </Avatar>

                      <Typography variant="h6" gutterBottom>
                        {achievement.name}
                      </Typography>

                      <Typography variant="body2" color="textSecondary" paragraph>
                        {achievement.description}
                      </Typography>

                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="textSecondary">
                            Progress
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {Math.round(progress)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: earned ? 'success.light' : 'grey.300',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: earned ? 'success.main' : 'primary.main'
                            }
                          }}
                        />
                      </Box>

                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Chip
                          icon={<Star />}
                          label={`+${achievement.points} points`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      </motion.div>
    </Container>
  );
};

export default AchievementsPage;