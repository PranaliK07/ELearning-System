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
  Settings as SettingsIcon,
  Tune as BusinessSettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import { useState, useEffect } from 'react';

const drawerWidth = 240;

const configuredModules = new Set([
  'dashboard',
  'subjects',
  'assignments',
  'content',
  'users',
  'reports',
  'analytics',
  'settings',
  'business-settings'
]);

const defaultRoleAccess = {
  admin: new Set(['dashboard', 'users', 'content', 'reports', 'analytics', 'settings', 'subjects', 'assignments', 'business-settings']),
  teacher: new Set(['dashboard', 'subjects', 'assignments', 'reports']),
  student: new Set(['dashboard', 'subjects', 'assignments'])
};

const loadRoleAccess = (_version = 0) => {
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
  const { user } = useAuth();
  const [accessVersion, setAccessVersion] = useState(0);

  useEffect(() => {
    const handler = () => setAccessVersion(v => v + 1);
    window.addEventListener('roleAccessUpdated', handler);
    return () => window.removeEventListener('roleAccessUpdated', handler);
  }, []);

  // Sync sidebar permissions from server once per session
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
        if (process.env.NODE_ENV === 'development') {
          console.warn('Role access fetch skipped', err?.response?.status);
        }
      }
    };
    syncAccess();
  }, [user?.id]);

  const role = user?.role || 'student';
  const roleAccess = loadRoleAccess(accessVersion);
  const allowed = roleAccess[role] || defaultRoleAccess[role] || defaultRoleAccess.student;

  const items = [
    { key: 'dashboard', text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { key: 'subjects', text: 'Study', icon: <StudyIcon />, path: '/study' },
    { key: 'play', text: 'Play', icon: <PlayIcon />, path: '/play' },
    { key: 'progress', text: 'Progress', icon: <ProgressIcon />, path: '/progress' },
    { key: 'achievements', text: 'Achievements', icon: <AchievementsIcon />, path: '/achievements' },
    { key: 'profile', text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
    { key: 'assignments', text: 'Assignments', icon: <AssignmentIcon />, path: '/assignments/create' },
    { key: 'reports', text: 'Reports', icon: <ReportsIcon />, path: '/reports' },
    { key: 'content', text: 'Content', icon: <StudyIcon />, path: '/content/create' },
    { key: 'settings', text: 'Settings', icon: <SettingsIcon />, path: '/profile/edit' },
    { key: 'business-settings', text: 'Business Settings', icon: <BusinessSettingsIcon />, path: '/dashboard?tab=business' },
  ];

  const displayItems = items.filter(({ key }) => {
    // If the module is part of configuredModules, show only if allowed. Otherwise leave unchanged.
    if (configuredModules.has(key)) {
      return allowed.has(key);
    }
    return true;
  }).filter(({ key }) => {
    // Basic role guards: students don't see teacher/admin only links when not allowed
    if (key === 'assignments' || key === 'reports' || key === 'content' || key === 'business-settings') {
      return role === 'teacher' || role === 'admin' || allowed.has(key);
    }
    return true;
  });

  const drawer = (
    <div>
      <Toolbar>
        <Box sx={{ textAlign: 'center', width: '100%' }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              margin: '10px auto',
              border: '3px solid #3f51b5'
            }}
            src={user?.avatar ? `/uploads/avatars/${user.avatar}` : undefined}
          >
            {user?.name?.charAt(0).toUpperCase()}
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
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={
                item.key === 'business-settings'
                  ? location.pathname === '/dashboard' && location.search.includes('tab=business')
                  : item.key === 'dashboard'
                    ? location.pathname === '/dashboard' && !location.search.includes('tab=business')
                    : location.pathname === item.path
              }
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
                    (item.key === 'business-settings'
                      ? location.pathname === '/dashboard' && location.search.includes('tab=business')
                      : item.key === 'dashboard'
                        ? location.pathname === '/dashboard' && !location.search.includes('tab=business')
                        : location.pathname === item.path)
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
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
