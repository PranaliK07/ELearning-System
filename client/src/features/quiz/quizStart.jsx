import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  Alert,
  Skeleton,
  Grid
} from '@mui/material';
import {
  AccessTime,
  Quiz as QuizIcon,
  EmojiEvents,
  ArrowForward
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';

const QuizStart = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bestScore, setBestScore] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`/api/quiz/${quizId}`);
        setQuiz(response.data);
        setBestScore(response.data.bestScore);
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleStartQuiz = () => {
    navigate(`/quiz/${quizId}/run`);
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="text" height={60} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <div>
        <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
          <QuizIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          
          <Typography variant="h3" gutterBottom sx={{ fontFamily: '"Comic Neue", cursive' }}>
            {quiz?.title}
          </Typography>
          
          <Typography variant="h6" color="textSecondary" paragraph>
            {quiz?.description}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={4}>
              <Box>
                <AccessTime sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h5">{quiz?.timeLimit} min</Typography>
                <Typography variant="body2" color="textSecondary">Time Limit</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={4}>
              <Box>
                <QuizIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                <Typography variant="h5">{quiz?.questions?.length || 0}</Typography>
                <Typography variant="body2" color="textSecondary">Questions</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={4}>
              <Box>
                <EmojiEvents sx={{ fontSize: 40, color: 'warning.main' }} />
                <Typography variant="h5">{quiz?.passingScore}%</Typography>
                <Typography variant="body2" color="textSecondary">Passing Score</Typography>
              </Box>
            </Grid>
          </Grid>

          {bestScore !== null && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              Your best score: {bestScore}%
            </Alert>
          )}

          <Box sx={{ textAlign: 'left', mb: 3 }}>
            <Typography variant="h6" gutterBottom>Instructions:</Typography>
            <ul style={{ paddingLeft: 20 }}>
              <li>Read each question carefully</li>
              <li>You have {quiz?.timeLimit} minutes to complete the quiz</li>
              <li>You need {quiz?.passingScore}% to pass</li>
              <li>You have {quiz?.maxAttempts} attempts maximum</li>
              <li>Each question has only one correct answer</li>
            </ul>
          </Box>

          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            onClick={handleStartQuiz}
            sx={{ py: 2, px: 6, fontSize: '1.2rem' }}
          >
            Start Quiz
          </Button>
        </Paper>
      </div>
    </Container>
  );
};

export default QuizStart;
