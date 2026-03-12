import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const grades = [
  { level: 1, name: 'Class 1', description: 'Beginner Level', color: '#FF6B6B', icon: '🌈' },
  { level: 2, name: 'Class 2', description: 'Foundation', color: '#4ECDC4', icon: '🌟' },
  { level: 3, name: 'Class 3', description: 'Building Skills', color: '#45B7D1', icon: '🎨' },
  { level: 4, name: 'Class 4', description: 'Intermediate', color: '#96CEB4', icon: '📚' },
  { level: 5, name: 'Class 5', description: 'Advanced', color: '#FFEAA7', icon: '🚀' }
];

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
      const response = await axios.get('/api/content/grades', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGradeData(response.data);
    } catch (error) {
      console.error('Error fetching grades:', error);
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontFamily: '"Comic Neue", cursive',
              fontWeight: 'bold',
              color: 'primary.main'
            }}
          >
            Choose Your Class 📚
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Select the grade you want to study
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {grades.map((grade, index) => (
            <Grid item xs={12} sm={6} md={4} key={grade.level}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
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
                    '&:hover': {
                      boxShadow: 8
                    }
                  }}
                >
                  <Box
                    sx={{
                      height: 140,
                      backgroundColor: grade.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="h1" component="div">
                      {grade.icon}
                    </Typography>
                  </Box>
                  <CardContent>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="h2"
                      sx={{ fontFamily: '"Comic Neue", cursive', fontWeight: 'bold' }}
                    >
                      {grade.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {grade.description}
                    </Typography>
                    
                    {user?.grade === grade.level && (
                      <Box
                        sx={{
                          mt: 2,
                          backgroundColor: 'success.main',
                          color: 'white',
                          p: 1,
                          borderRadius: 2,
                          textAlign: 'center'
                        }}
                      >
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