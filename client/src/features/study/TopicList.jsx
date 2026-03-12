import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  ExpandMore,
  PlayCircle,
  MenuBook,
  Quiz,
  CheckCircle,
  Lock,
  EmojiEvents
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useProgress } from '../../context/ProgressContext';

const TopicList = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { getSubjectProgress } = useProgress();
  const [topics, setTopics] = useState([]);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchTopics();
  }, [subjectId]);

  const fetchTopics = async () => {
    try {
      const response = await axios.get(`/api/content/subjects/${subjectId}/topics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTopics(response.data);
      if (response.data.length > 0) {
        setSubject(response.data[0].Subject);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  const handleContentClick = (content) => {
    if (content.type === 'video') {
      navigate(`/play/${content.id}`);
    } else if (content.type === 'reading') {
      navigate(`/study/content/${content.id}`);
    } else if (content.type === 'quiz') {
      navigate(`/quiz/${content.id}/start`);
    }
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'video':
        return <PlayCircle color="primary" />;
      case 'reading':
        return <MenuBook color="secondary" />;
      case 'quiz':
        return <Quiz color="warning" />;
      default:
        return <MenuBook />;
    }
  };

  const subjectProgress = getSubjectProgress(subjectId);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontFamily: '"Comic Neue", cursive',
              fontWeight: 'bold',
              color: 'primary.main'
            }}
          >
            {subject?.name || 'Subject'} Topics 📚
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<EmojiEvents />}
              label={`${subjectProgress}% Complete`}
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<MenuBook />}
              label={`${topics.length} Topics`}
              variant="outlined"
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={subjectProgress}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </Box>

        {/* Topics List */}
        <Grid container spacing={3}>
          {topics.map((topic, index) => (
            <Grid item xs={12} key={topic.id}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Accordion
                  expanded={expanded === topic.id}
                  onChange={handleAccordionChange(topic.id)}
                  sx={{
                    borderRadius: 3,
                    '&:before': { display: 'none' },
                    boxShadow: 2
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    sx={{
                      '& .MuiAccordionSummary-content': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'primary.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Box flex={1}>
                      <Typography variant="h6">{topic.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {topic.Contents?.length || 0} lessons • {topic.Quizzes?.length || 0} quizzes
                      </Typography>
                    </Box>
                    <Chip
                      label={`${Math.round((topic.Contents?.filter(c => c.completed)?.length || 0) / (topic.Contents?.length || 1) * 100)}%`}
                      size="small"
                      color="success"
                    />
                  </AccordionSummary>
                  
                  <AccordionDetails>
                    <List>
                      {topic.Contents?.map((content) => (
                        <ListItem
                          key={content.id}
                          button
                          onClick={() => handleContentClick(content)}
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            bgcolor: 'background.default',
                            '&:hover': {
                              bgcolor: 'action.hover'
                            }
                          }}
                        >
                          <ListItemIcon>
                            {getContentIcon(content.type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={content.title}
                            secondary={
                              <Box component="span" display="flex" gap={1}>
                                <Typography variant="caption" color="textSecondary">
                                  {content.duration} min
                                </Typography>
                                {content.completed && (
                                  <Chip
                                    icon={<CheckCircle />}
                                    label="Completed"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            }
                          />
                          <Button
                            variant={content.completed ? "outlined" : "contained"}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContentClick(content);
                            }}
                          >
                            {content.completed ? 'Review' : 'Start'}
                          </Button>
                        </ListItem>
                      ))}

                      {topic.Quizzes?.map((quiz) => (
                        <ListItem
                          key={quiz.id}
                          button
                          onClick={() => navigate(`/quiz/${quiz.id}/start`)}
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            bgcolor: 'warning.light',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'warning.main'
                            }
                          }}
                        >
                          <ListItemIcon sx={{ color: 'white' }}>
                            <Quiz />
                          </ListItemIcon>
                          <ListItemText
                            primary={quiz.title}
                            secondary={
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                {quiz.questions?.length || 0} questions • {quiz.timeLimit} min
                              </Typography>
                            }
                          />
                          <Button
                            variant="contained"
                            size="small"
                            sx={{ bgcolor: 'white', color: 'warning.main' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/quiz/${quiz.id}/start`);
                            }}
                          >
                            Take Quiz
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Container>
  );
};

export default TopicList;