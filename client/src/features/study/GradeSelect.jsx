import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const gradeStyles = {
  1: { color: '#FF6B6B', icon: '??', description: 'Beginner Level' },
  2: { color: '#4ECDC4', icon: '??', description: 'Foundation' },
  3: { color: '#45B7D1', icon: '??', description: 'Building Skills' },
  4: { color: '#96CEB4', icon: '??', description: 'Intermediate' },
  5: { color: '#FFEAA7', icon: '??', description: 'Advanced' }
};

const GradeSelect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [gradeData, setGradeData] = useState([]);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/grades');
      const grades = (Array.isArray(response.data) ? response.data : []).map((g) => ({
        ...g,
        ...(gradeStyles[g.level] || { color: '#45B7D1', icon: '??', description: `Class ${g.level}` })
      }));
      setGradeData(grades);
    } catch (error) {
      console.error('Error fetching grades:', error);
      setGradeData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSelect = (grade) => {
    navigate(`/study/grade/${grade.level}`);
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
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontFamily: '"Comic Neue", cursive', fontWeight: 'bold', color: 'primary.main' }}>
            Choose Your Class ??
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Select the grade you want to study
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {gradeData.map((grade, index) => (
            <Grid item xs={12} sm={6} md={4} key={grade.level}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card
                  onClick={() => handleGradeSelect(grade)}
                  sx={{
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    overflow: 'hidden',
                    position: 'relative',
                    '&:hover': { boxShadow: 8 }
                  }}
                >
                  <Box sx={{ height: 140, backgroundColor: grade.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h1" component="div">{grade.icon}</Typography>
                  </Box>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2" sx={{ fontFamily: '"Comic Neue", cursive', fontWeight: 'bold' }}>
                      {grade.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">{grade.description}</Typography>

                    {Number(user?.grade) === Number(grade.level) && (
                      <Box sx={{ mt: 2, backgroundColor: 'success.main', color: 'white', p: 1, borderRadius: 2, textAlign: 'center' }}>
                        Your Current Class
                      </Box>
                    )}
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

export default GradeSelect;
