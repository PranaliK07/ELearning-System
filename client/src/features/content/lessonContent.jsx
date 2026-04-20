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
  Download,
  Description
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';
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
      const response = await axios.get(`/api/content/${contentId}`);
      setContent(response.data);
    } catch (error) {
      console.error('Error fetching content:', error);
      setContent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!content?.id) return;
    await updateProgress(content.id, {
      completed: true,
      watchTime: content.duration || 5
    });
    setCompleted(true);
  };

  const handleWatchVideo = () => {
    if (!content?.id) return;
    navigate(`/play/video/${content.id}`);
  };

  const handleTakeQuiz = () => {
    if (!content?.Quiz?.id) return;
    navigate(`/quiz/${content.Quiz.id}/start`);
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

  const handleDownload = async () => {
    if (!content?.readingMaterial) return;

    try {
      const url = content.readingMaterial;
      const filename = `${content.title || 'notes'}.pdf`;

      let fullUrl = url;
      if (!url.startsWith('http')) {
        const backendOrigin = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
        fullUrl = `${backendOrigin}${url}`;
      }

      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(link);
      }, 100);
    } catch (error) {
      console.error('Download error:', error);
      const backendOrigin = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
      window.open(content.readingMaterial.startsWith('http') ? content.readingMaterial : `${backendOrigin}${content.readingMaterial}`, '_blank');
    }
  };

    return (
        <Container maxWidth="md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                    Back to Topics
                </Button>

                <Paper sx={{ p: 4, borderRadius: 4 }}>
                    <Box sx={{ mb: 3 }}>
                        <Box display="flex" alignItems="center" gap={2} mb={2} flexWrap="wrap">
                            <Chip label={content?.type} color={content?.type === 'video' ? 'primary' : 'secondary'} />
                            {completed && <Chip icon={<CheckCircle />} label="Completed" color="success" />}
                        </Box>

                        <Typography variant="h4" gutterBottom>{content?.title}</Typography>
                        <Typography variant="body1" color="textSecondary" paragraph>{content?.description}</Typography>

                        <Box display="flex" gap={2} flexWrap="wrap">
                            <Chip label={`${content?.duration || 0} minutes`} variant="outlined" />
                            {content?.isPremium && <Chip label="Premium" color="warning" variant="outlined" />}
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ mb: 4 }}>
                        {content?.type === 'reading' && (
                            <Box sx={{ typography: 'body1', '& img': { maxWidth: '100%', borderRadius: 2 }, '& h1, & h2, & h3': { color: 'primary.main', mt: 3, mb: 2 } }}>
                                {content.readingMaterial?.startsWith('/uploads') ? (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Description sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                        <Typography>PDF Notes available for download</Typography>
                                    </Box>
                                ) : (
                                    <ReactMarkdown>{content?.readingMaterial || 'No content available.'}</ReactMarkdown>
                                )}
                            </Box>
                        )}

                        {content?.type === 'video' && (
                            <Box
                                sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: 'black', borderRadius: 2, overflow: 'hidden', cursor: 'pointer' }}
                                onClick={handleWatchVideo}
                            >
                                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
                                    <PlayCircle sx={{ fontSize: 80, color: 'white' }} />
                                </Box>
                            </Box>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {content?.type === 'video' && (
                            <Button variant="contained" size="large" startIcon={<PlayCircle />} onClick={handleWatchVideo} sx={{ flex: 1 }}>
                                Watch Video
                            </Button>
                        )}

                        {!completed && (
                            <Button variant={content?.type === 'video' ? 'outlined' : 'contained'} size="large" startIcon={<CheckCircle />} onClick={handleMarkComplete} sx={{ flex: 1 }}>
                                Mark as Complete
                            </Button>
                        )}

                        {content?.Quiz && (
                            <Button variant="contained" color="warning" size="large" startIcon={<Quiz />} onClick={handleTakeQuiz} sx={{ flex: 1 }}>
                                Take Quiz
                            </Button>
                        )}

                        {content?.type === 'reading' && content?.readingMaterial && (
                            <Button 
                                variant="outlined" 
                                size="large" 
                                startIcon={<Download />} 
                                onClick={handleDownload}
                                sx={{ flex: 1 }}
                            >
                                Download PDF
                            </Button>
                        )}
                    </Box>
                </Paper>
            </motion.div>
        </Container>
    );
};

export default LessonContent;
