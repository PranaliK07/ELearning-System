import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';

const SubjectCard = ({ subject, progress, onClick, index }) => {
  const getIcon = (name) => {
    switch(name.toLowerCase()) {
      case 'mathematics': return '🔢';
      case 'english': return '📖';
      case 'science': return '🔬';
      case 'hindi': return '🇮🇳';
      case 'environmental studies': return '🌍';
      default: return '📚';
    }
  };

  const getColor = (name) => {
    switch(name.toLowerCase()) {
      case 'mathematics': return '#FF6B6B';
      case 'english': return '#4ECDC4';
      case 'science': return '#45B7D1';
      case 'hindi': return '#96CEB4';
      case 'environmental studies': return '#FFEAA7';
      default: return '#3f51b5';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        onClick={onClick}
        sx={{
          cursor: 'pointer',
          height: '100%',
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
            height: 100,
            backgroundColor: getColor(subject.name),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h2" component="div">
            {getIcon(subject.name)}
          </Typography>
        </Box>
        
        <CardContent>
          <Typography
            gutterBottom
            variant="h5"
            component="h2"
            sx={{ fontFamily: '"Comic Neue", cursive', fontWeight: 'bold' }}
          >
            {subject.name}
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Progress
              </Typography>
              <Typography variant="body2" color="primary" fontWeight="bold">
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundColor: getColor(subject.name)
                }
              }}
            />
          </Box>

          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`${subject.topicCount || 8} Topics`}
              size="small"
              icon={<span>📚</span>}
              variant="outlined"
            />
            <Chip
              label={`${subject.videoCount || 12} Videos`}
              size="small"
              icon={<span>🎥</span>}
              variant="outlined"
            />
            <Chip
              label={`${subject.quizCount || 5} Quizzes`}
              size="small"
              icon={<span>📝</span>}
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SubjectCard;