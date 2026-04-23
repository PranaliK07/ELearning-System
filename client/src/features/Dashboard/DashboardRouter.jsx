import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import VideosHome from './VideosHome';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';
import { Box, Button, CircularProgress, Menu, MenuItem, Stack, useTheme } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

const DEMO_ROLE_STORAGE_KEY = 'demoDashboardRole';
const DEMO_ROLE_EVENT = 'demoDashboardRoleUpdated';

const DemoDashboard = () => {
    const theme = useTheme();
    const [rolesAnchorEl, setRolesAnchorEl] = useState(null);
    const [selectedRole, setSelectedRole] = useState(() => sessionStorage.getItem(DEMO_ROLE_STORAGE_KEY) || 'admin');

    const syncDemoRole = (role) => {
        sessionStorage.setItem(DEMO_ROLE_STORAGE_KEY, role);
        window.dispatchEvent(new Event(DEMO_ROLE_EVENT));
    };

    const handleRolesClick = (event) => {
        setRolesAnchorEl(event.currentTarget);
    };

    const handleRolesClose = () => {
        setRolesAnchorEl(null);
    };

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        syncDemoRole(role);
        handleRolesClose();
    };

    useEffect(() => {
        syncDemoRole(selectedRole);
    }, [selectedRole]);

    const renderModule = () => {
        switch (selectedRole) {
            case 'admin':
                return <AdminDashboard />;
            case 'teacher':
                return <TeacherDashboard />;
            case 'student':
            default:
                return <VideosHome />;
        }
    };

    return (
        <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1 }}>
                <Button
                    onClick={handleRolesClick}
                    endIcon={<ExpandMore />}
                    sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 999,
                        textTransform: 'none',
                        fontWeight: 700,
                        color: 'white',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 55%, ${theme.palette.secondary.main} 100%)`,
                        boxShadow: `0 10px 24px ${theme.palette.primary.main}33`,
                        '&:hover': {
                            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, ${theme.palette.secondary.dark} 100%)`,
                            boxShadow: `0 12px 28px ${theme.palette.primary.main}44`,
                        },
                    }}
                >
                    Roles
                </Button>
                <Menu
                    anchorEl={rolesAnchorEl}
                    open={Boolean(rolesAnchorEl)}
                    onClose={handleRolesClose}
                    PaperProps={{
                        sx: {
                            mt: 1,
                            borderRadius: 3,
                            minWidth: 180,
                            overflow: 'hidden',
                            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.18)',
                        }
                    }}
                >
                    <MenuItem selected={selectedRole === 'admin'} onClick={() => handleRoleSelect('admin')}>
                        Admin
                    </MenuItem>
                    <MenuItem selected={selectedRole === 'student'} onClick={() => handleRoleSelect('student')}>
                        Student
                    </MenuItem>
                    <MenuItem selected={selectedRole === 'teacher'} onClick={() => handleRoleSelect('teacher')}>
                        Teacher
                    </MenuItem>
                </Menu>
            </Box>
            {renderModule()}
        </Stack>
    );
};

const DashboardRouter = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                <CircularProgress />
            </Box>
        );
    }

    const renderDashboard = () => {
        switch (user?.role) {
            case 'admin':
                return <AdminDashboard />;
            case 'demo':
                return <DemoDashboard />;
            case 'teacher':
                return <TeacherDashboard />;
      case 'student':
      default:
            return <VideosHome />;
        }
    };

    return (
        <Stack spacing={2}>
            {renderDashboard()}
        </Stack>
    );
};

export default DashboardRouter;
