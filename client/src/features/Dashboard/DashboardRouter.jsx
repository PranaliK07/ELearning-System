import React from 'react';
import { useAuth } from '../../context/AuthContext';
import VideosHome from './VideosHome';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';
import { CircularProgress, Box } from '@mui/material';

const DashboardRouter = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                <CircularProgress />
            </Box>
        );
    }

    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      case 'student':
      default:
            return <VideosHome />;
    }
};

export default DashboardRouter;
