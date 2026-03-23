import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  IconButton
} from '@mui/material';
import { PlayCircle, TrendingUp, Schedule, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import { resolveMediaUrl } from '../../utils/helpers';

const VideoGrid = ({ title, items, loading, grade, onWatch, onRetry }) => (
  <Box sx={{ mb: 4 }}>
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      flexDirection={{ xs: 'column', sm: 'row' }}
      gap={1}
      mb={2}
    >
      <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <PlayCircle color="primary" /> {title}
      </Typography>
      <Box display="flex" alignItems="center" gap={1}>
        {grade ? <Chip label={`Grade ${grade}`} color="primary" variant="outlined" /> : null}
        {onRetry ? (
          <IconButton size="small" onClick={onRetry}>
            <Refresh fontSize="small" />
          </IconButton>
        ) : null}
      </Box>
    </Box>

    {loading ? (
      <LinearProgress sx={{ borderRadius: 10 }} />
    ) : items.length ? (
      <Grid container spacing={2}>
        {items.map((video) => (
          <Grid item xs={12} sm={6} md={3} key={video.id}>
            <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="140"
                image={
                  resolveMediaUrl(video.thumbnail) ||
                  `https://source.unsplash.com/random/300x140?education&sig=${video.id}`
                }
                alt={video.title}
              />
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                  {video.title}
                </Typography>
                {video.creator?.name ? (
                  <Typography variant="caption" color="textSecondary">
                    By {video.creator.name}
                  </Typography>
                ) : null}
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip size="small" variant="outlined" label={video.subjectName || video.Subject?.name || 'General'} />
                  <Chip size="small" variant="outlined" label={video.topicName || video.Topic?.name || 'General'} />
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ height: 40, overflow: 'hidden', mt: 0.5 }}>
                  {video.description || 'New video from your teachers'}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                  <Chip size="small" label={video.duration ? `${video.duration} min` : 'Video'} />
                  <Button
                    size="small"
                    variant="contained"
                    sx={{ borderRadius: 5 }}
                    onClick={() => onWatch(video.id)}
                  >
                    Watch
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    ) : (
      <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 3 }}>
        <Typography color="textSecondary">
          No videos yet. Your teacher uploads will appear here automatically.
        </Typography>
      </Box>
    )}
  </Box>
);

const StudentHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classVideos, setClassVideos] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loadingClass, setLoadingClass] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);

  const fetchClassVideos = async () => {
    try {
      setLoadingClass(true);
      const gradeParam = user?.grade ?? '';
      const res = await axios.get(`/api/content/class/${gradeParam}/videos`);
      setClassVideos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Class videos fetch error', err);
      setClassVideos([]);
    } finally {
      setLoadingClass(false);
    }
  };

  const fetchTrending = async () => {
    try {
      setLoadingTrending(true);
      const res = await axios.get('/api/content/trending');
      setTrending(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Trending fetch error', err);
      setTrending([]);
    } finally {
      setLoadingTrending(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchClassVideos();
      fetchTrending();
    }
  }, [user?.id, user?.grade]);

  return (
    <Container maxWidth="lg" sx={{ overflowX: 'hidden' }}>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name}! Ready to learn?
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          New uploads from your teachers appear here automatically.
        </Typography>
      </Box>

      <VideoGrid
        title="Videos for Your Class"
        items={classVideos}
        loading={loadingClass}
        onRetry={fetchClassVideos}
        grade={user?.grade}
        onWatch={(id) => navigate(`/play/video/${id}`)}
      />

      <VideoGrid
        title="Trending Now"
        items={trending}
        loading={loadingTrending}
        onRetry={fetchTrending}
        onWatch={(id) => navigate(`/play/video/${id}`)}
      />

      <Box sx={{ mb: 6 }}>
        <Typography variant="h6" gutterBottom>
          Looking for more?
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm="auto">
            <Button variant="contained" startIcon={<PlayCircle />} onClick={() => navigate('/study')}>
              Browse Subjects
            </Button>
          </Grid>
          <Grid item xs={12} sm="auto">
            <Button variant="outlined" startIcon={<TrendingUp />} onClick={() => navigate('/progress')}>
              View Progress
            </Button>
          </Grid>
          <Grid item xs={12} sm="auto">
            <Button variant="outlined" startIcon={<Schedule />} onClick={() => navigate('/quiz/1/start')}>
              Take a Quiz
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default StudentHome;
