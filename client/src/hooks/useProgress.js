import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export const useProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProgress = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await axios.get('/api/progress', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProgress(response.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateContentProgress = async (contentId, data) => {
    try {
      const response = await axios.post('/api/progress/update', 
        { contentId, ...data },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      // Refresh progress after update
      await fetchProgress();
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating progress:', error);
      return { success: false, error: error.message };
    }
  };

  const calculateSubjectProgress = (subjectId) => {
    if (!progress) return 0;
    
    const subjectContents = progress.filter(p => 
      p.Content?.Topic?.SubjectId === subjectId
    );
    
    if (subjectContents.length === 0) return 0;
    
    const completed = subjectContents.filter(p => p.completed).length;
    return Math.round((completed / subjectContents.length) * 100);
  };

  const calculateGradeProgress = (gradeId) => {
    if (!progress) return 0;
    
    const gradeContents = progress.filter(p => 
      p.Content?.Topic?.Subject?.GradeId === gradeId
    );
    
    if (gradeContents.length === 0) return 0;
    
    const completed = gradeContents.filter(p => p.completed).length;
    return Math.round((completed / gradeContents.length) * 100);
  };

  useEffect(() => {
    fetchProgress();
  }, [user]);

  return {
    progress,
    loading,
    updateContentProgress,
    calculateSubjectProgress,
    calculateGradeProgress,
    refreshProgress: fetchProgress
  };
};
