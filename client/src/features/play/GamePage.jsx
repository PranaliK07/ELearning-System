import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

const games = {
  'quick-quiz': {
    title: 'Quick Quiz',
    description: 'Answer 5 rapid-fire questions to practice recall.',
    questions: [
      { q: 'What is 7 x 8?', options: ['54', '56', '58', '64'], answer: '56' },
      { q: 'Water freezes at ___ °C?', options: ['0', '10', '32', '-10'], answer: '0' },
      { q: 'Capital of France?', options: ['Paris', 'Rome', 'Berlin', 'Madrid'], answer: 'Paris' },
      { q: 'Which is a prime number?', options: ['21', '27', '29', '33'], answer: '29' },
      { q: 'Light travels fastest in?', options: ['Air', 'Glass', 'Water', 'Vacuum'], answer: 'Vacuum' }
    ]
  },
  flashcards: {
    title: 'Flashcards',
    description: 'Flip cards to remember key facts.',
    cards: [
      { front: 'Photosynthesis uses ___', back: 'Sunlight + CO₂ + Water' },
      { front: 'Largest ocean', back: 'Pacific Ocean' },
      { front: 'Speed of light', back: '≈ 300,000 km/s' },
      { front: 'H₂O is', back: 'Water' }
    ]
  }
};

const GamePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const game = games[slug];

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState({});
  const [flipped, setFlipped] = useState(false);

  if (!game) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 3, mt: 4, borderRadius: 3 }}>
          <Typography variant="h5">Game not found</Typography>
          <Button sx={{ mt: 2 }} onClick={() => navigate('/play')} variant="contained">
            Back to Play
          </Button>
        </Paper>
      </Container>
    );
  }

  const handleAnswer = (option) => {
    if (answered[current]) return;
    const correct = game.questions[current].answer === option;
    setAnswered(prev => ({ ...prev, [current]: { option, correct } }));
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      setCurrent(idx => Math.min(idx + 1, game.questions.length - 1));
    }, 500);
  };

  const quizProgress = game.questions
    ? (Object.keys(answered).length / game.questions.length) * 100
    : 0;

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 4, borderRadius: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">{game.title}</Typography>
          <Button onClick={() => navigate('/play')} size="small">Back</Button>
        </Box>
        <Typography color="textSecondary" sx={{ mb: 3 }}>{game.description}</Typography>

        {game.questions && (
          <>
            <LinearProgress variant="determinate" value={quizProgress} sx={{ mb: 2, height: 8, borderRadius: 4 }} />
            <Card sx={{ mb: 2, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Q{current + 1}. {game.questions[current].q}
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  {game.questions[current].options.map((opt) => {
                    const state = answered[current];
                    const isSelected = state?.option === opt;
                    const isCorrect = game.questions[current].answer === opt;
                    return (
                      <Button
                        key={opt}
                        variant={isSelected ? (state?.correct ? 'contained' : 'outlined') : 'outlined'}
                        color={isSelected ? (state?.correct ? 'success' : 'error') : 'primary'}
                        onClick={() => handleAnswer(opt)}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        {opt}
                        {isCorrect && state ? <Chip label="Correct" color="success" size="small" sx={{ ml: 1 }} /> : null}
                      </Button>
                    );
                  })}
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                  Score: {score} / {game.questions.length}
                </Typography>
              </CardContent>
            </Card>
          </>
        )}

        {game.cards && (
          <Card sx={{ borderRadius: 3, textAlign: 'center' }}>
            <CardContent
              onClick={() => setFlipped(f => !f)}
              sx={{
                minHeight: 140,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 1
              }}
            >
              <Typography variant="subtitle2" color="textSecondary">
                Tap to flip
              </Typography>
              <Typography variant="h6">
                {flipped ? game.cards[current % game.cards.length].back : game.cards[current % game.cards.length].front}
              </Typography>
            </CardContent>
            <Box display="flex" justifyContent="space-between" p={2}>
              <Button onClick={() => setCurrent(c => (c - 1 + game.cards.length) % game.cards.length)}>Prev</Button>
              <Button onClick={() => setCurrent(c => (c + 1) % game.cards.length)}>Next</Button>
            </Box>
          </Card>
        )}
      </Paper>
    </Container>
  );
};

export default GamePage;
