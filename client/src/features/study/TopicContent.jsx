import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Chip
} from '@mui/material';
import { PlayCircle, Quiz, Assignment, ArrowBack } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const TopicContent = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [topic, setTopic] = useState(null);
  const [contents, setContents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetchTopicData();
  }, [topicId]);

  const normalizeMediaUrl = (src) => {
    if (!src) return '';
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    if (src.startsWith('/')) return src;
    return `/${src}`;
  };

  const fallbackThumb =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#1e3c72"/>
            <stop offset="1" stop-color="#2a5298"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
        <circle cx="300" cy="170" r="54" fill="rgba(255,255,255,0.15)"/>
        <polygon points="292,150 292,190 324,170" fill="#ffffff"/>
        <text x="300" y="275" font-size="20" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-family="Arial, sans-serif">
          Video
        </text>
      </svg>`
    );

  const fetchTopicData = async () => {
    try {
      setLoading(true);
      const [topicRes, contentRes, quizRes] = await Promise.all([
        axios.get(`/api/topics/${topicId}`),
        axios.get(`/api/topics/${topicId}/contents`),
        axios.get(`/api/topics/${topicId}/quizzes`)
      ]);

      const nextTopic = topicRes.data || null;
      const nextContents = Array.isArray(contentRes.data) ? contentRes.data : [];
      const nextQuizzes = Array.isArray(quizRes.data) ? quizRes.data : [];

      setTopic(nextTopic);
      setContents(nextContents);
      setQuizzes(nextQuizzes);

      if (user?.role === 'student' && user?.grade && nextTopic?.Subject?.GradeId && Number(nextTopic.Subject.GradeId) !== Number(user.grade)) {
        navigate(`/study/grade/${user.grade}`, { replace: true });
      }
    } catch (error) {
      console.error('Error fetching topic content:', error);
      setTopic(null);
      setContents([]);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const videos = contents.filter((item) => item.type === 'video');
  const homework = contents.filter((item) => item.type === 'activity' || item.type === 'reading');

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
            Back to Topics
          </Button>
          <Box>
            <Typography variant="h4" sx={{ fontFamily: '"Comic Neue", cursive', fontWeight: 'bold', color: 'primary.main' }}>
              {topic?.name || 'Topic'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {topic?.Subject?.name || 'Subject'}
            </Typography>
          </Box>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3 }}
        >
          <Tab label={`Videos (${videos.length})`} />
          <Tab label={`Fun Test (${quizzes.length})`} />
          <Tab label={`Homework (${homework.length})`} />
        </Tabs>

        {tab === 0 && (
          <Grid container spacing={3}>
            {videos.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 3 }}>
                  <Typography color="textSecondary">No videos for this topic yet.</Typography>
                </Box>
              </Grid>
            )}
            {videos.map((video) => {
              const videoSrc = normalizeMediaUrl(
                video.videoUrl || video.videoFile || video.video?.url || video.contentUrl || video.url
              );
              const thumbSrc = normalizeMediaUrl(video.thumbnail || video.thumb || '');
              return (
              <Grid item xs={12} sm={6} md={4} key={video.id}>
                <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {thumbSrc ? (
                    <CardMedia
                      component="img"
                      height="160"
                      image={thumbSrc}
                      alt={video.title}
                    />
                  ) : videoSrc ? (
                    <Box sx={{ height: 160, bgcolor: 'black' }}>
                      <video
                        src={videoSrc}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  ) : (
                    <CardMedia
                      component="img"
                      height="160"
                      image={fallbackThumb}
                      alt={video.title}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} noWrap>
                      {video.title}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {topic?.name || 'Topic'}
                      </Typography>
                    </Box>
                  </CardContent>
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Button fullWidth variant="contained" startIcon={<PlayCircle />} onClick={() => navigate(`/play/video/${video.id}`)}>
                      Play Video
                    </Button>
                  </Box>
                </Card>
              </Grid>
            )})}
          </Grid>
        )}

        {tab === 1 && (
          <Grid container spacing={3}>
            {quizzes.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 3 }}>
                  <Typography color="textSecondary">No quizzes for this topic yet.</Typography>
                </Box>
              </Grid>
            )}
            {quizzes.map((quiz) => (
              <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ height: 140, bgcolor: 'secondary.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Quiz sx={{ fontSize: 56, color: 'white' }} />
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} noWrap>
                      {quiz.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {quiz.timeLimit ? `${quiz.timeLimit} min` : 'Quick quiz'}
                    </Typography>
                  </CardContent>
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Button fullWidth variant="contained" color="secondary" onClick={() => navigate(`/quiz/${quiz.id}/start`)}>
                      Start Quiz
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {tab === 2 && (
          <Grid container spacing={3}>
            {homework.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 3 }}>
                  <Typography color="textSecondary">No homework for this topic yet.</Typography>
                </Box>
              </Grid>
            )}
            {homework.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {item.thumbnail ? (
                    <CardMedia
                      component="img"
                      height="140"
                      image={normalizeMediaUrl(item.thumbnail)}
                      alt={item.title}
                    />
                  ) : (
                    <Box sx={{ height: 140, bgcolor: 'success.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Assignment sx={{ fontSize: 56, color: 'white' }} />
                    </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} noWrap>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {item.description || 'Practice activity'}
                    </Typography>
                  </CardContent>
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Button fullWidth variant="contained" color="success" onClick={() => navigate(`/study/content/${item.id}`)}>
                      Open Homework
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </motion.div>
    </Container>
  );
};

export default TopicContent;
