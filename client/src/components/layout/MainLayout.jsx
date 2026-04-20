import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, IconButton, Typography, Avatar, Menu, MenuItem, Badge, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Home as HomeIcon,
  VideoLibrary,
  Description,
  Assignment,
  Quiz,
  EventAvailable,
  QuestionAnswer,
  Star,
  Campaign
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import BottomNav from './BottomNav';
import ErrorBoundary from '../common/ErrorBoundary';
import Sidebar from './Sidebar';
import { resolveAvatarSrc } from '../../utils/media';
import { useNotification } from '../../context/notificationContext';
import ConfirmDialog from '../common/ConfirmDialog';

const getNotificationStyle = (type) => {
  switch (type) {
    case 'new_video':
      return { icon: <VideoLibrary fontSize="small" />, color: '#f44336' };
    case 'new_notes':
      return { icon: <Description fontSize="small" />, color: '#2196f3' };
    case 'new_assignment':
      return { icon: <Assignment fontSize="small" />, color: '#4caf50' };
    case 'new_quiz':
      return { icon: <Quiz fontSize="small" />, color: '#9c27b0' };
    case 'attendance':
      return { icon: <EventAvailable fontSize="small" />, color: '#ff9800' };
    case 'doubt':
    case 'doubt_reply':
      return { icon: <QuestionAnswer fontSize="small" />, color: '#00bcd4' };
    case 'achievement':
      return { icon: <Star fontSize="small" />, color: '#ffeb3b' };
    case 'announcement':
      return { icon: <Campaign fontSize="small" />, color: '#3f51b5' };
    default:
      return { icon: <NotificationsIcon fontSize="small" />, color: '#9e9e9e' };
  }
};

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { mode, setMode } = React.useContext(ThemeContext);
  const { 
    notifications, 
    unreadCount, 
    loadingNotifications, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    deleteNotification
  } = useNotification();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    // Automatically delete notification once it is opened/clicked
    deleteNotification(notification.id);

    const source = notification?.data?.source;
    const communicationId = notification?.data?.communicationId;
    
    if (source === 'class_communication' && communicationId) {
      handleNotificationsClose();
      navigate(`/communications/${communicationId}`);
      return;
    }

    switch (notification.type) {
      case 'doubt':
      case 'doubt_reply':
        handleNotificationsClose();
        navigate('/doubts');
        break;
      case 'new_video':
      case 'new_notes':
        handleNotificationsClose();
        if (notification.data?.contentId) {
          navigate(`/study/content/${notification.data.contentId}`);
        } else {
          navigate('/study');
        }
        break;
      case 'new_assignment':
        handleNotificationsClose();
        if (notification.data?.assignmentId) {
          navigate(`/assignments/view/${notification.data.assignmentId}`);
        }
        break;
      case 'new_quiz':
        handleNotificationsClose();
        if (notification.data?.quizId) {
          navigate(`/quiz/${notification.data.quizId}/start`);
        }
        break;
      case 'attendance':
        handleNotificationsClose();
        navigate('/attendance');
        break;
      default:
        handleNotificationsClose();
        break;
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    handleMenuClose();
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    setLogoutDialogOpen(false);
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const toggleTheme = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <ConfirmDialog
        open={logoutDialogOpen}
        title="Logout"
        description="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={confirmLogout}
      />
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: mode === 'light' 
            ? 'linear-gradient(135deg, #0B1F3B 0%, #B0125B 100%)' 
            : 'linear-gradient(135deg, #08162B 0%, #17325C 100%)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontFamily: '"Comic Neue", cursive',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            🎓 Kids Learn
          </Typography>

          <IconButton color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
            <HomeIcon />
          </IconButton>

          <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
            {mode === 'light' ? <DarkIcon /> : <LightIcon />}
          </IconButton>

          <IconButton color="inherit" sx={{ mr: 1 }} onClick={handleNotificationsOpen}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar 
              alt={user?.name} 
              src={resolveAvatarSrc(user?.avatar)}
              sx={{ 
                width: 40, 
                height: 40,
                border: '2px solid white'
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfile}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>

          <Menu
            anchorEl={notificationsAnchorEl}
            open={Boolean(notificationsAnchorEl)}
            onClose={handleNotificationsClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{ sx: { width: 340, maxWidth: '90vw' } }}
          >
            <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Notifications
              </Typography>
              <Typography
                variant="caption"
                sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 600 }}
                onClick={markAllAsRead}
              >
                Mark all read
              </Typography>
            </Box>
            <Divider />
            {loadingNotifications && (
              <Box sx={{ px: 2, py: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Loading notifications...
                </Typography>
              </Box>
            )}
            {!loadingNotifications && notifications.length === 0 && (
              <Box sx={{ px: 2, py: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  No notifications yet.
                </Typography>
              </Box>
            )}
            {!loadingNotifications && notifications.map((item) => {
              const { icon, color } = getNotificationStyle(item.type);
              return (
                <MenuItem
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  sx={{
                    alignItems: 'flex-start',
                    whiteSpace: 'normal',
                    gap: 2,
                    py: 1.5,
                    bgcolor: item.isRead ? 'transparent' : 'rgba(176,18,91,0.08)',
                    borderLeft: item.isRead ? 'none' : `4px solid ${color}`,
                    '&:hover': {
                      bgcolor: item.isRead ? 'rgba(0,0,0,0.04)' : 'rgba(176,18,91,0.12)'
                    }
                  }}
                >
                  <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 36, height: 36 }}>
                    {icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: item.isRead ? 600 : 800, color: item.isRead ? 'text.primary' : 'primary.main' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                      {item.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </MenuItem>
              );
            })}
          </Menu>
        </Toolbar>
      </AppBar>

      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - 240px)` },
          ml: { sm: '240px' },
          mt: { xs: '56px', sm: '64px' },
          mb: { xs: '56px', sm: 0 },
          p: { xs: 2, sm: 3 }
        }}
      >
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </Box>

      <BottomNav />
    </Box>
  );
};

export default MainLayout;
