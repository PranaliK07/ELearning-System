import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Divider,
  Avatar,
  Typography,
  Chip
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  MenuBook as StudyIcon,
  PlayCircle as PlayIcon,
  Timeline as ProgressIcon,
  EmojiEvents as AchievementsIcon,
  Person as ProfileIcon,
  Star as StarIcon,
  Assignment as AssignmentIcon,
  BarChart as ReportsIcon,
  Campaign as CampaignIcon,
  Settings as SettingsIcon,
  Tune as BusinessSettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import { useState, useEffect } from 'react';
import { resolveAvatarSrc } from '../../utils/media';

const drawerWidth = 240;
const appBarHeights = { xs: 56, sm: 64 };

const configuredModules = new Set([
  'dashboard',
  'subjects',
  'homework',
  'assignments',
  'communications',
  'content',
  'users',
  'reports',
  'analytics',
  'settings',
  'business-settings'
]);

const defaultRoleAccess = {
  admin: new Set(['dashboard', 'users', 'content', 'reports', 'analytics', 'settings', 'subjects', 'assignments', 'communications', 'business-settings']),
  teacher: new Set(['dashboard', 'subjects', 'assignments', 'reports', 'communications']),
  student: new Set(['dashboard', 'subjects', 'assignments'])
};

const loadRoleAccess = () => {
  try {
    const saved = localStorage.getItem('roleAccess');
    if (!saved) return defaultRoleAccess;
    const parsed = JSON.parse(saved);
    return Object.fromEntries(
      Object.entries(parsed).map(([role, modules]) => [role, new Set(modules)])
    );
  } catch (e) {
    console.warn('Failed to load role access from storage', e);
    return defaultRoleAccess;
  }
};

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [accessVersion, setAccessVersion] = useState(0);

  useEffect(() => {
    const handler = () => setAccessVersion(v => v + 1);
    window.addEventListener('roleAccessUpdated', handler);
    return () => window.removeEventListener('roleAccessUpdated', handler);
  }, []);

  useEffect(() => {
    const syncAccess = async () => {
      try {
        const res = await api.get('/api/admin/role-access');
        if (res.data) {
          localStorage.setItem('roleAccess', JSON.stringify(res.data));
          window.dispatchEvent(new Event('roleAccessUpdated'));
        }
      } catch (err) {
        // Silently ignore if user isn't allowed; defaults/local cache will be used
        if (import.meta?.env?.DEV) {
          console.warn('Role access fetch skipped', err?.response?.status);
        }
      }
    };
    syncAccess();
  }, [user?.id]);

  const role = user?.role || 'student';
  const roleAccess = loadRoleAccess(accessVersion);
  const allowed = roleAccess[role] || defaultRoleAccess[role] || defaultRoleAccess.student;

  const currentPath = `${location.pathname}${location.search || ''}`;
  const currentTab = new URLSearchParams(location.search).get('tab');

  const items = [
    { key: 'dashboard', text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { key: 'users', text: 'User Management', icon: <ProfileIcon />, path: '/admin/users' },
    { key: 'content', text: 'Content Overview', icon: <StudyIcon />, path: '/admin/content' },
    { key: 'subjects', text: 'Study', icon: <StudyIcon />, path: '/study' },
    { key: 'play', text: 'Play', icon: <PlayIcon />, path: '/play' },
    { key: 'progress', text: 'Progress', icon: <ProgressIcon />, path: '/progress' },
    { key: 'achievements', text: 'Achievements', icon: <AchievementsIcon />, path: '/achievements' },
    { key: 'profile', text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
    { key: 'assignments', text: 'Assignments', icon: <AssignmentIcon />, path: '/assignments/create' },
    { key: 'reports', text: 'Reports', icon: <ReportsIcon />, path: '/reports' },
    { key: 'communications', text: 'Class Communication', icon: <CampaignIcon />, path: '/class-communication' },
    { key: 'content', text: 'Content', icon: <StudyIcon />, path: '/content/create' },
    { key: 'play', text: 'Quize', icon: <PlayIcon />, path: '/play' },
    { key: 'progress', text: 'Progress', icon: <ProgressIcon />, path: '/progress' },
    { key: 'achievements', text: 'Achievements', icon: <AchievementsIcon />, path: '/achievements' },
    { key: 'profile', text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
    { key: 'settings', text: 'Settings', icon: <SettingsIcon />, path: '/profile/edit' },
    { key: 'business-settings', text: 'Business Settings', icon: <BusinessSettingsIcon />, path: '/dashboard?tab=business' },
  ];

  const isSelected = (item) => {
    if (item.key === 'dashboard') {
      return location.pathname === '/dashboard' && !currentTab;
    }
    if (item.path.startsWith('/dashboard?tab=')) {
      return location.pathname === '/dashboard' && currentPath === item.path;
    }
    return location.pathname === item.path;
  };

  const displayItems = items.filter(({ key }) => {
    if (role === 'student' && key === 'assignments') {
      return false;
    }
    if (role === 'student' && key === 'homework') {
      return true;
    }
    if (configuredModules.has(key)) {
      return allowed.has(key);
    }
    return true;
  }).filter(({ key }) => {
    // Basic role guards: students don't see teacher/admin only links when not allowed
    if (key === 'assignments' || key === 'reports' || key === 'content' || key === 'business-settings' || key === 'communications') {
      return role === 'teacher' || role === 'admin' || allowed.has(key);
    }
    return true;
  });

  const handleLogoutClick = () => {
    const shouldLogout = window.confirm('Are you sure you want to logout?');
    if (!shouldLogout) return;
    logout();
    navigate('/login');
    if (mobileOpen) handleDrawerToggle();
  };

  const drawer = (
    <div>
      <Toolbar>
        <Box
          sx={{ textAlign: 'center', width: '100%', cursor: 'pointer' }}
          onClick={() => {
            navigate('/profile');
            if (mobileOpen) handleDrawerToggle();
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              margin: '10px auto',
              border: '3px solid #3f51b5'
            }}
            src={resolveAvatarSrc(user?.avatar)}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Typography variant="h6" noWrap>
            {user?.name}
          </Typography>
          <Chip
            icon={<StarIcon />}
            label={`${user?.points || 0} Points`}
            size="small"
            color="primary"
            sx={{ mt: 1 }}
          />
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {displayItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton
              selected={isSelected(item)}
              onClick={() => {
                navigate(item.path);
                if (mobileOpen) handleDrawerToggle();
              }}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    isSelected(item)
                      ? 'white'
                      : 'inherit'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogoutClick}
            sx={{
              color: 'error.main',
              '& .MuiListItemIcon-root': {
                color: 'error.main'
              },
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.08)'
              }
            }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            mt: `${appBarHeights.xs}px`,
            height: `calc(100% - ${appBarHeights.xs}px)`
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            mt: `${appBarHeights.sm}px`,
            height: `calc(100% - ${appBarHeights.sm}px)`
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
