import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  IconButton
} from '@mui/material';
import {
  AccessTime,
  ArrowBack,
  ArrowForward,
  Flag
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { useTimer } from '../../hooks/useTimer';

const QuizRunner = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [flagged, setFlagged] = useState([]);

  const timer = useTimer(timeLeft, () => handleTimeUp());

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`/api/quiz/${quizId}/questions`);
        setQuiz(response.data);
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz) {
      setTimeLeft(quiz.timeLimit * 60);
      setAnswers(new Array(quiz.questions.length).fill(null));
      setFlagged(new Array(quiz.questions.length).fill(false));
    }
  }, [quiz]);

  const handleTimeUp = () => {
    submitQuiz();
  };

  const handleAnswerChange = (event) => {
    setSelectedAnswer(event.target.value);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = event.target.value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] || '');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || '');
    }
  };

  const handleFlag = () => {
    const newFlagged = [...flagged];
    newFlagged[currentQuestion] = !newFlagged[currentQuestion];
    setFlagged(newFlagged);
  };

  const submitQuiz = async () => {
    try {
      const response = await axios.post(`/api/quiz/${quizId}/submit`, {
        answers
      });
      
      navigate(`/quiz/${quizId}/result`, { state: { result: response.data } });
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !quiz) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const question = quiz.questions[currentQuestion];

  return (
    <Container maxWidth="lg">
      <div>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" gutterBottom>
                {quiz.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={handleFlag} color={flagged[currentQuestion] ? 'warning' : 'default'}>
                <Flag />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime color={timer < 60 ? 'error' : 'action'} />
                <Typography 
                  variant="h6" 
                  color={timer < 60 ? 'error' : 'textPrimary'}
                >
                  {formatTime(timer)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Progress Bar */}
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4, mb: 3 }}
          />

          {/* Question */}
          <div key={currentQuestion}>
              <Paper sx={{ p: 4, bgcolor: 'background.default', borderRadius: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {question.question}
                </Typography>

                {question.image && (
                  <Box sx={{ my: 2, textAlign: 'center' }}>
                    <img 
                      src={question.image} 
                      alt="Question" 
                      style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
                    />
                  </Box>
                )}

                <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
                  <RadioGroup value={selectedAnswer} onChange={handleAnswerChange}>
                    {question.options.map((option, index) => (
                      <FormControlLabel
                        key={index}
                        value={option}
                        control={<Radio />}
                        label={option}
                        sx={{
                          p: 1,
                          mb: 1,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          width: '100%',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Paper>
            </div>

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outlined"
            >
              Previous
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                color="warning"
                onClick={() => {/* Show question palette */}}
              >
                Question {currentQuestion + 1}
              </Button>
              
              {currentQuestion === quiz.questions.length - 1 ? (
                <Button
                  variant="contained"
                  color="success"
                  onClick={submitQuiz}
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  endIcon={<ArrowForward />}
                  onClick={handleNext}
                  variant="contained"
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </div>
    </Container>
  );
};

export default QuizRunner;
