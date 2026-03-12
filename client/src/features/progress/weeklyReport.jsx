import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  Button
} from '@mui/material';
import {
  AccessTime,
  EmojiEvents,
  TrendingUp,
  School,
  Download,
  Share
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import TimeSpentChart from '../../components/charts/TimeSpentChart';
import ProgressChart from '../../components/charts/ProgressChart';

const WeeklyReport = () => {
  const weekData = {
    totalWatchTime: 245,
    avgWatchTime: 35,
    completedLessons: 12,
    quizzesTaken: 5,
    avgScore: 82,
    pointsEarned: 150,
    topSubject: 'Mathematics',
    dailyData: [30, 45, 25, 60, 35, 50, 0]
  };

  const achievements = [
    { name: 'Quick Learner', date: 'Jan 15, 2024', points: 20 },
    { name: 'Math Wizard', date: 'Jan 14, 2024', points: 30 },
    { name: 'Consistent Student', date: 'Jan 13, 2024', points: 25 },
  ];

  const subjectData = {
    labels: ['Math', 'Science', 'English', 'Hindi', 'EVS'],
    datasets: [
      {
        label: 'Hours Spent',
        data: [5, 3, 4, 2, 3],
        backgroundColor: [
          '#FF6B6B',
          '#4ECDC4',
          '#45B7D1',
          '#96CEB4',
          '#FFEAA7'
        ]
      }
    ]
  };

  const handleDownload = () => {
    // Implement PDF download
  };

  const handleShare = () => {
    // Implement share functionality
  };

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontFamily: '"Comic Neue", cursive' }}>
            Weekly Progress Report 📊
          </Typography>
          <Typography variant="body1" color="textSecondary">
            January 8 - January 14, 2024
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, borderRadius: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                <AccessTime />
              </Avatar>
              <Typography variant="h4" color="primary">
                {weekData.totalWatchTime}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Minutes
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, borderRadius: 3 }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
                <School />
              </Avatar>
              <Typography variant="h4" color="success.main">
                {weekData.completedLessons}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Lessons Completed
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, borderRadius: 3 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2 }}>
                <TrendingUp />
              </Avatar>
              <Typography variant="h4" color="warning.main">
                {weekData.avgScore}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Average Quiz Score
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, borderRadius: 3 }}>
              <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 2 }}>
                <EmojiEvents />
              </Avatar>
              <Typography variant="h4" color="info.main">
                {weekData.pointsEarned}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Points Earned
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" gutterBottom>
                Daily Watch Time
              </Typography>
              <TimeSpentChart data={weekData.dailyData} height={300} />
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" gutterBottom>
                Time per Subject
              </Typography>
              <ProgressChart type="doughnut" data={subjectData} height={300} />
              <Box sx={{ mt: 2 }}>
                {subjectData.labels.map((label, index) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: 2,
                        bgcolor: subjectData.datasets[0].backgroundColor[index],
                        mr: 1
                      }}
                    />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {subjectData.datasets[0].data[index]} hrs
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Achievements and Highlights */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" gutterBottom>
                Achievements Unlocked
              </Typography>
              <List>
                {achievements.map((achievement, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.light' }}>
                          <EmojiEvents />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={achievement.name}
                        secondary={achievement.date}
                      />
                      <Chip
                        label={`+${achievement.points}`}
                        size="small"
                        color="success"
                      />
                    </ListItem>
                    {index < achievements.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" gutterBottom>
                Weekly Highlights
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="primary">
                  🌟 Best Day: Wednesday
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  You studied for 60 minutes and completed 3 lessons!
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="primary">
                  📚 Favorite Subject: {weekData.topSubject}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  You spent most time learning Mathematics
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" color="primary">
                  🏆 Best Quiz Score: 95%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  In "Introduction to Numbers" quiz
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleDownload}
            size="large"
          >
            Download Report
          </Button>
          <Button
            variant="outlined"
            startIcon={<Share />}
            onClick={handleShare}
            size="large"
          >
            Share with Parents
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
};

export default WeeklyReport;