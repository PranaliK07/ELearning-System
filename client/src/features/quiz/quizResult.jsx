import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  EmojiEvents,
  Refresh,
  Home,
  Share
} from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

const QuizResult = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { result } = location.state || { result: { score: 0, total: 0, passed: false, answers: [] } };

  const percentage = Math.round((result.score / result.total) * 100);
  const passed = percentage >= 70;

  const handleRetry = () => {
    navigate(`/quiz/${quizId}/run`);
  };

  const handleHome = () => {
    navigate('/dashboard');
  };

  const handleShare = () => {
    // Share functionality
  };

  return (
    <>
      {passed && <Confetti recycle={false} numberOfPieces={200} />}
      
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
            {/* Result Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              {passed ? (
                <EmojiEvents sx={{ fontSize: 100, color: 'warning.main' }} />
              ) : (
                <Cancel sx={{ fontSize: 100, color: 'error.main' }} />
              )}
            </motion.div>

            <Typography variant="h3" gutterBottom sx={{ mt: 2 }}>
              {passed ? 'Congratulations! 🎉' : 'Better Luck Next Time! 📚'}
            </Typography>

            <Typography variant="h6" color="textSecondary" paragraph>
              {passed 
                ? 'You have successfully passed the quiz!' 
                : 'Don\'t worry, you can try again!'}
            </Typography>

            {/* Score Card */}
            <Paper
              sx={{
                p: 3,
                bgcolor: passed ? 'success.light' : 'error.light',
                color: 'white',
                borderRadius: 3,
                my: 3
              }}
            >
              <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
                {percentage}%
              </Typography>
              <Typography variant="h5">
                {result.score} / {result.total} Correct
              </Typography>
            </Paper>

            {/* Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <Box>
                  <Typography variant="h4" color="success.main">
                    {result.score}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Correct
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box>
                  <Typography variant="h4" color="error.main">
                    {result.total - result.score}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Incorrect
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box>
                  <Typography variant="h4" color="primary.main">
                    {result.total}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Earned Badges */}
            {passed && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Badges Earned
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Chip
                    icon={<EmojiEvents />}
                    label="Quiz Master"
                    color="warning"
                    sx={{ fontSize: '1rem', py: 2 }}
                  />
                  <Chip
                    icon={<CheckCircle />}
                    label="Sharp Mind"
                    color="success"
                    sx={{ fontSize: '1rem', py: 2 }}
                  />
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Answer Review */}
            <Box sx={{ textAlign: 'left', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Question Review
              </Typography>
              <List>
                {result.answers?.map((answer, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      {answer.correct ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Cancel color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={`Question ${index + 1}`}
                      secondary={`Your answer: ${answer.selected || 'Not answered'}`}
                    />
                    <Chip
                      label={answer.correct ? 'Correct' : 'Incorrect'}
                      color={answer.correct ? 'success' : 'error'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {!passed && (
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={handleRetry}
                  size="large"
                >
                  Try Again
                </Button>
              )}
              <Button
                variant={passed ? 'contained' : 'outlined'}
                startIcon={<Home />}
                onClick={handleHome}
                size="large"
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={handleShare}
                size="large"
              >
                Share Result
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </>
  );
};

export default QuizResult;