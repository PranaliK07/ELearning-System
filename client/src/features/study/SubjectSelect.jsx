import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  LinearProgress,
  Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';
import { useProgress } from '../../context/ProgressContext';

const SubjectSelect = () => {
  const { gradeId } = useParams();
  const navigate = useNavigate();
  const { getGradeProgress } = useProgress();
  const [loading, setLoading] = useState(false);
  const [subjectData, setSubjectData] = useState([]);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    fetchSubjects();
  }, [gradeId]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/subjects?gradeId=${gradeId}`);
      const data = Array.isArray(response.data) ? response.data : [];
      setSubjectData(data);

      const progressData = {};
      data.forEach((subject) => {
        progressData[subject.id] = getGradeProgress(Number(gradeId));
      });
      setProgress(progressData);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjectData([]);
      setProgress({});
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelect = (subjectId) => {
    navigate(`/study/subject/${subjectId}`);
  };

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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: '"Comic Neue", cursive', fontWeight: 'bold', color: 'primary.main' }}>
            Class {gradeId} Subjects ??
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Choose a subject to start learning
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {subjectData.map((subject, index) => (
            <Grid item xs={12} sm={6} md={4} key={subject.id}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card onClick={() => handleSubjectSelect(subject.id)} sx={{ cursor: 'pointer', height: '100%', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                  <Box sx={{ height: 120, backgroundColor: subject.color || '#45B7D1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h2" component="div">{subject.icon || '??'}</Typography>
                  </Box>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2" sx={{ fontFamily: '"Comic Neue", cursive', fontWeight: 'bold' }}>
                      {subject.name}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="textSecondary">Progress</Typography>
                        <Typography variant="body2" color="primary" fontWeight="bold">{progress[subject.id] || 0}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress[subject.id] || 0}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundColor: subject.color || '#45B7D1'
                          }
                        }}
                      />
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={`${subject.Topics?.length || 0} Topics`} size="small" variant="outlined" />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Container>
  );
};

export default SubjectSelect;
