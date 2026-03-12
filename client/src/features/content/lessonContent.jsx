import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  Skeleton
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  PlayCircle,
  Quiz,
  Download
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useProgress } from '../../context/ProgressContext';

const LessonContent = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const { updateProgress, getContentProgress } = useProgress();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [contentId]);

  useEffect(() => {
    if (content) {
      const progress = getContentProgress(content.id);
      setCompleted(progress?.completed || false);
    }
  }, [content, getContentProgress]);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`/api/content/content/${contentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setContent(response.data);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    await updateProgress(content.id, {
      completed: true,
      watchTime: content.duration || 5
    });
    setCompleted(true);
  };

  const handleWatchVideo = () => {
    navigate(`/play/${content.id}`);
  };

  const handleTakeQuiz = () => {
    navigate(`/quiz/${content.Quiz?.id}/start`);
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="text" height={60} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
          <Skeleton variant="text" height={30} sx={{ mt: 2 }} />
          <Skeleton variant="text" height={30} />
          <Skeleton variant="text" height={30} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back to Topics
        </Button>

        <Paper sx={{ p: 4, borderRadius: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Chip
                label={content?.type}
                color={content?.type === 'video' ? 'primary' : 'secondary'}
              />
              {completed && (
                <Chip
                  icon={<CheckCircle />}
                  label="Completed"
                  color="success"
                />
              )}
            </Box>
            
            <Typography variant="h4" gutterBottom>
              {content?.title}
            </Typography>
            
            <Typography variant="body1" color="textSecondary" paragraph>
              {content?.description}
            </Typography>

            <Box display="flex" gap={2} flexWrap="wrap">
              <Chip label={`${content?.duration} minutes`} variant="outlined" />
              {content?.isPremium && (
                <Chip label="Premium" color="warning" variant="outlined" />
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Main Content */}
          <Box sx={{ mb: 4 }}>
            {content?.type === 'reading' && (
              <Box sx={{ 
                typography: 'body1',
                '& img': { maxWidth: '100%', borderRadius: 2 },
                '& h1, & h2, & h3': { color: 'primary.main', mt: 3, mb: 2 }
              }}>
                <ReactMarkdown>
                  {content?.readingMaterial || 'No content available.'}
                </ReactMarkdown>
              </Box>
            )}

            {content?.type === 'video' && (
              <Box
                sx={{
                  position: 'relative',
                  paddingTop: '56.25%',
                  bgcolor: 'black',
                  borderRadius: 2,
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onClick={handleWatchVideo}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.5)'
                  }}
                >
                  <PlayCircle sx={{ fontSize: 80, color: 'white' }} />
                </Box>
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {content?.type === 'video' && (
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayCircle />}
                onClick={handleWatchVideo}
                sx={{ flex: 1 }}
              >
                Watch Video
              </Button>
            )}

            {!completed && (
              <Button
                variant={content?.type === 'video' ? 'outlined' : 'contained'}
                size="large"
                startIcon={<CheckCircle />}
                onClick={handleMarkComplete}
                sx={{ flex: 1 }}
              >
                Mark as Complete
              </Button>
            )}

            {content?.Quiz && (
              <Button
                variant="contained"
                color="warning"
                size="large"
                startIcon={<Quiz />}
                onClick={handleTakeQuiz}
                sx={{ flex: 1 }}
              >
                Take Quiz
              </Button>
            )}

            {content?.type === 'reading' && (
              <Button
                variant="outlined"
                size="large"
                startIcon={<Download />}
                sx={{ flex: 1 }}
              >
                Download PDF
              </Button>
            )}
          </Box>

          {/* Additional Resources */}
          {content?.resources && content.resources.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Additional Resources
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {content.resources.map((resource, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    startIcon={<Download />}
                    href={resource.url}
                    target="_blank"
                  >
                    {resource.name}
                  </Button>
                ))}
              </Box>
            </>
          )}
        </Paper>
      </motion.div>
    </Container>
  );
};

export default LessonContent;