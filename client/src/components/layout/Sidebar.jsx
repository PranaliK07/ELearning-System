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
  Star as StarIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Study', icon: <StudyIcon />, path: '/study' },
    { text: 'Play', icon: <PlayIcon />, path: '/play/recent' },
    { text: 'Progress', icon: <ProgressIcon />, path: '/progress' },
    { text: 'Achievements', icon: <AchievementsIcon />, path: '/achievements' },
    { text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
  ];

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
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
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
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'white' : 'inherit' }}>
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