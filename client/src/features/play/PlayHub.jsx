import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SportsEsports, FlashOn } from '@mui/icons-material';

const games = [
  {
    slug: 'quick-quiz',
    title: 'Quick Quiz',
    desc: '5 rapid-fire questions to test what you learned today.',
    badge: '5 questions',
    image: 'https://images.unsplash.com/photo-1453749024858-4bca89bd9edc?auto=format&fit=crop&w=1200&q=80',
    icon: <SportsEsports />
  },
  {
    slug: 'flashcards',
    title: 'Flashcards',
    desc: 'Flip cards and recall key concepts faster.',
    badge: 'Memory',
    image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80',
    icon: <FlashOn />
  }
];

const PlayHub = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Play & Practice
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Pick a study game to reinforce today&apos;s lessons.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {games.map((game) => (
          <Grid item xs={12} sm={6} md={4} key={game.slug}>
            <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box
                sx={{
                  position: 'relative',
                  pt: '56.25%', // 16:9
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%), url(${game.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#111'
                }}
              >
                <Avatar
                  sx={{
                    position: 'absolute',
                    bottom: 14,
                    left: 14,
                    bgcolor: 'primary.main',
                    width: 48,
                    height: 48,
                    boxShadow: 3
                  }}
                >
                  {game.icon}
                </Avatar>
              </Box>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6">{game.title}</Typography>
                  <Chip label={game.badge} size="small" color="primary" />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {game.desc}
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ borderRadius: 5, mt: 1 }}
                    onClick={() => navigate(`/play/game/${game.slug}`)}
                  >
                    Play now
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default PlayHub;
