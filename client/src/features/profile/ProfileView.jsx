import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  Edit,
  Email,
  School,
  EmojiEvents,
  AccessTime,
  Star,
  TrendingUp,
  CalendarToday,
  People,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import LinearProgress from '@mui/material/LinearProgress';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';
import { resolveAvatarSrc } from '../../utils/media';

const ProfileView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { watchTimeStats } = useProgress();

  const stats = user?.role === 'student' ? [
    { label: 'Total Watch Time', value: `${Math.round((watchTimeStats?.totalWatchTime || 0) / 60)}h`, icon: <AccessTime /> },
    { label: 'Points Earned', value: user?.points || 0, icon: <Star /> },
    { label: 'Achievements', value: '12', icon: <EmojiEvents /> },
    { label: 'Days Active', value: '45', icon: <CalendarToday /> }
  ] : [
    { label: 'Students Managed', value: '45', icon: <People /> },
    { label: 'Assignments Created', value: '24', icon: <AssignmentIcon /> },
    { label: 'Classes', value: '6', icon: <School /> },
    { label: 'Days Active', value: '120', icon: <CalendarToday /> }
  ];

  const recentActivities = [
    { activity: 'Completed Mathematics Quiz', score: '85%', date: '2 hours ago' },
    { activity: 'Watched Introduction to Numbers', duration: '15 min', date: 'Yesterday' },
    { activity: 'Earned Quick Learner Badge', points: '+10', date: '2 days ago' },
    { activity: 'Completed Science Lesson', topic: 'Plants', date: '3 days ago' }
  ];

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography color="textSecondary">Loading profile...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Profile Header */}
        <Paper sx={{ p: 4, borderRadius: 4, mb: 3 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Avatar
                  sx={{
                    width: 150,
                    height: 150,
                    mx: 'auto',
                    border: '4px solid',
                    borderColor: 'primary.main',
                    fontSize: '3rem'
                  }}
                  src={resolveAvatarSrc(user?.avatar)}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </motion.div>
              
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => navigate('/profile/edit')}
                sx={{ mt: 2 }}
              >
                Edit Profile
              </Button>
            </Grid>

            <Grid item xs={12} md={9}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h3" gutterBottom>
                    {user?.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<Email />}
                      label={user?.email}
                      variant="outlined"
                    />
                    <Chip
                      icon={<School />}
                      label={`Class ${user?.grade || 'Not Set'}`}
                      color="primary"
                    />
                    <Chip
                      icon={<EmojiEvents />}
                      label={user?.role}
                      color="secondary"
                    />
                  </Box>
                </Box>
              </Box>

              <Typography variant="body1" color="textSecondary" paragraph>
                {user?.role === 'teacher' ? 'Professional Educator at Kids Learn Platform' : 'Student at Kids Learn Platform'} • Learning since 2024
              </Typography>

              <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                <Box>
                  <Typography variant="h5" color="primary">
                    {user?.grade || '-'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Current Class
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5" color="primary">
                    {user?.points || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Points
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5" color="primary">
                    {Math.round((watchTimeStats?.totalWatchTime || 0) / 60)}h
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Watch Time
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', mx: 'auto', mb: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h4" gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity & Progress */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h5" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUp color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.activity}
                        secondary={
                          <Box component="span">
                            <Typography variant="caption" color="textSecondary">
                              {activity.score || activity.duration || activity.topic} • {activity.date}
                            </Typography>
                          </Box>
                        }
                      />
                      {activity.points && (
                        <Chip
                          label={activity.points}
                          size="small"
                          color="success"
                        />
                      )}
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h5" gutterBottom>
                Learning Stats
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Mathematics</Typography>
                    <Typography variant="body2" fontWeight="bold">75%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 4 }} />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Science</Typography>
                    <Typography variant="body2" fontWeight="bold">60%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={60} sx={{ height: 8, borderRadius: 4 }} />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">English</Typography>
                    <Typography variant="body2" fontWeight="bold">85%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={85} sx={{ height: 8, borderRadius: 4 }} />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Hindi</Typography>
                    <Typography variant="body2" fontWeight="bold">45%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={45} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/progress')}
                sx={{ mt: 2 }}
              >
                View Detailed Progress
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default ProfileView;
