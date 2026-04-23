import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, IconButton, Typography, Avatar, Menu, MenuItem, Badge, Divider, useTheme, Chip } from '@mui/material';
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
import { isAdminLikeRole, getDemoRemainingTime } from '../../utils/roles';

const getNotificationStyle = (type) => {
  switch (type) {
    case 'new_video':
      return { icon: <VideoLibrary fontSize="small" />, color: '#f44336' };
    case 'new_notes':
      return { icon: <Description fontSize="small" />, color: '#2196f3' };
    case 'new_assignment':
      return { icon: <Assignment fontSize="small" />, color: '#4caf50' };
    case 'assignment_submission':
      return { icon: <Assignment fontSize="small" />, color: '#ff9800' };
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
  const theme = useTheme();
  const { 
    currentTime,
    notifications, 
    unreadCount, 
    loadingNotifications, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    deleteNotification
  } = useNotification();
  
  React.useEffect(() => {
    console.log('[MainLayout Diagnostic] Current User:', user?.id, 'Role:', user?.role, 'Unread Count:', unreadCount);
  }, [user, unreadCount]);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const demoTimeLeft = user?.role === 'demo' ? getDemoRemainingTime(user?.trialEndsAt, currentTime) : null;
  const demoLabel = demoTimeLeft
    ? (
      demoTimeLeft.days > 0
        ? `${demoTimeLeft.days}d ${demoTimeLeft.hours}h ${demoTimeLeft.minutes}m left`
        : demoTimeLeft.hours > 0
          ? `${demoTimeLeft.hours}h ${demoTimeLeft.minutes}m left`
          : demoTimeLeft.minutes > 0
            ? `${demoTimeLeft.minutes}m left`
            : `less than 1m left`
    )
    : '';
  const isAdminLike = isAdminLikeRole(user?.role);

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
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    // Remove the notification after it is opened/clicked
    deleteNotification(notification.id);

    handleNotificationsClose();

    const { type, data } = notification;
    const role = user?.role;

    // Handle legacy/specific source data
    const source = data?.source;
    const communicationId = data?.communicationId || data?.id;
    
    if (source === 'class_communication' && communicationId) {
      return navigate(`/communications/${communicationId}`);
    }

    // Modern type-based routing
    switch (type) {
      case 'doubt':
      case 'doubt_reply':
        navigate(isAdminLike ? '/admin/doubts' : '/doubts');
        break;

      case 'new_quiz':
      case 'quiz':
        if (data?.quizId) {
          navigate(`/quiz/${data.quizId}/start`);
        } else {
          navigate('/play#quizzes');
        }
        break;

      case 'quiz_result':
      case 'achievement':
        navigate('/achievements');
        break;

      case 'new_assignment':
      case 'assignment':
        if (data?.assignmentId) {
          navigate(`/assignments/view/${data.assignmentId}`);
        } else {
          navigate(role === 'student' ? '/homework' : '/assignments/create');
        }
        break;

      case 'assignment_submission':
        if (data?.assignmentId) {
          navigate(role === 'student' ? `/assignments/view/${data.assignmentId}` : `/assignments/${data.assignmentId}/submissions`);
        } else {
          navigate('/assignments/create');
        }
        break;

      case 'new_video':
        if (data?.contentId) {
          navigate(`/play/video/${data.contentId}`);
        } else {
          navigate('/play');
        }
        break;

      case 'new_notes':
        if (data?.contentId) {
          navigate(`/study/content/${data.contentId}`);
        } else {
          navigate('/study-material');
        }
        break;

      case 'announcement':
        navigate('/dashboard');
        break;

      case 'class_communication':
        if (communicationId) {
          navigate(`/communications/${communicationId}`);
        } else {
          navigate('/class-communication');
        }
        break;

      case 'attendance':
        navigate(role === 'student' ? '/attendance' : '/attendance/manage');
        break;

      case 'content':
        if (data?.contentId) {
          navigate(`/study/content/${data.contentId}`);
        } else {
          navigate((isAdminLike || role === 'teacher') ? '/admin/content' : '/study');
        }
        break;

      default:
        console.warn('[Notifications] No specific route for type:', type);
        navigate('/dashboard');
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

          {user?.role === 'demo' && demoTimeLeft && (
            <Chip
              label={`Demo ${demoLabel}`}
              size="small"
              variant="outlined"
              sx={{
                mr: 1,
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.45)',
                display: { xs: 'none', sm: 'inline-flex' }
              }}
            />
          )}

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
            <MenuItem 
              onClick={handleLogout} 
              sx={{ 
                bgcolor: '#8b0000 !important', 
                color: '#FFFFFF !important',
                fontWeight: 'bold',
                m: '4px',
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: '#5d0000 !important'
                }
              }}
            >
              Logout
            </MenuItem>
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
            {!loadingNotifications && notifications.map((item) => (
              <MenuItem
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                sx={{
                  py: 1.5,
                  px: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  whiteSpace: 'normal',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  gap: 0.5,
                  bgcolor: item.isRead ? 'transparent' : theme.palette.action.hover,
                  '&:hover': {
                    bgcolor: theme.palette.action.selected,
                  }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: item.isRead ? 600 : 800, color: 'text.primary' }}>
                  {item.title}
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ lineHeight: 1.4 }}>
                  {item.message}
                </Typography>
                <Typography variant="caption" sx={{ mt: 0.5, color: 'text.disabled', fontSize: '0.7rem' }}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </AppBar>

      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', sm: 'auto' },
          minWidth: 0,
          mt: { xs: '84px', sm: '100px' }, // Further increased space below navbar
          mb: { xs: '84px', sm: 0 },
          pl: { xs: 2, sm: 8 }, // Further increased space from sidebar
          pr: { xs: 2, sm: 6 },
          py: { xs: 2, sm: 4 },
          overflowX: 'hidden'
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
