import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  PlayCircle as PlayIcon,
  MenuBook as StudyIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getValue = () => {
    if (location.pathname.startsWith('/play')) return 0;
    if (location.pathname.startsWith('/study')) return 1;
    if (location.pathname.startsWith('/dashboard')) return 2;
    return 2;
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        display: { xs: 'block', sm: 'none' },
        zIndex: 1000
      }} 
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={getValue()}
        onChange={(event, newValue) => {
          switch(newValue) {
            case 0:
              navigate('/play');
              break;
            case 1:
              navigate('/study');
              break;
            case 2:
              navigate('/dashboard');
              break;
            default:
              break;
          }
        }}
      >
        <BottomNavigationAction label="Quize" icon={<PlayIcon />} />
        <BottomNavigationAction label="Study" icon={<StudyIcon />} />
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
