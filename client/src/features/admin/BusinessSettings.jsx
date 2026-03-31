import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { Settings } from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const defaultRoleAccess = {
  admin: new Set(['dashboard', 'subjects', 'play', 'progress', 'achievements', 'profile', 'users', 'content', 'reports', 'reports-issues', 'settings', 'new-lesson', 'subject-topic', 'assignments', 'communications', 'business-settings']),
  teacher: new Set(['dashboard', 'subjects', 'play', 'progress', 'achievements', 'profile', 'new-lesson', 'subject-topic', 'assignments', 'reports', 'communications']),
  student: new Set(['dashboard', 'subjects', 'play', 'progress', 'achievements', 'profile', 'assignments']),
};

const modules = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'subjects', label: 'Study' },
  { key: 'play', label: 'Play' },
  { key: 'progress', label: 'Progress' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'profile', label: 'Profile' },
  { key: 'new-lesson', label: 'New Lesson' },
  { key: 'subject-topic', label: 'Subject & Topic' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'communications', label: 'Class Communication' },
  { key: 'content', label: 'Content Overview' },
  { key: 'users', label: 'User Management' },
  { key: 'reports', label: 'Reports' },
  { key: 'reports-issues', label: 'Reports & Issues' },
  { key: 'settings', label: 'System Settings' },
  { key: 'business-settings', label: 'Business Settings' },
];

const BusinessSettings = () => {
  const [roleAccess, setRoleAccess] = useState(defaultRoleAccess);
  const [serverAccessAvailable, setServerAccessAvailable] = useState(true);

  const loadSavedAccess = () => {
    try {
      const saved = localStorage.getItem('roleAccess');
      if (!saved) return;
      const parsed = JSON.parse(saved);
      setRoleAccess(Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, new Set(value)])));
    } catch (err) {
      console.warn('Failed to parse saved role access', err);
    }
  };

  useEffect(() => {
    loadSavedAccess();
  }, []);

  useEffect(() => {
    const fetchAccess = async () => {
      if (!serverAccessAvailable) return;
      try {
        const res = await api.get('/api/admin/role-access');
        if (res.data) {
          setRoleAccess(Object.fromEntries(Object.entries(res.data).map(([key, value]) => [key, new Set(value)])));
        }
      } catch (err) {
        if (err?.response?.status === 404) {
          setServerAccessAvailable(false);
        }
        loadSavedAccess();
      }
    };

    fetchAccess();
  }, [serverAccessAvailable]);

  const saveAccess = async () => {
    const serialized = Object.fromEntries(
      Object.entries(roleAccess).map(([role, value]) => [role, Array.from(value)])
    );

    try {
      if (serverAccessAvailable) {
        await api.post('/api/admin/role-access', serialized);
        toast.success('Access saved to server');
      } else {
        throw { response: { status: 404 } };
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        toast('Not authorized on server; saved locally only', { icon: '💾' });
      } else if (err?.response?.status === 404) {
        setServerAccessAvailable(false);
        toast.success('Saved locally. Server endpoint not available yet.', { icon: '💾' });
      } else {
        toast.error('Save failed; stored locally for now');
      }
    } finally {
      localStorage.setItem('roleAccess', JSON.stringify(serialized));
      window.dispatchEvent(new Event('roleAccessUpdated'));
    }
  };

  return (
    <Container maxWidth="lg">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Business Settings
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Control which sidebar modules each role can access.
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<Settings />} onClick={saveAccess}>
              Save Access
            </Button>
          </Box>

          <Grid container spacing={3}>
            {['admin', 'teacher', 'student'].map((role) => (
              <Grid item xs={12} md={4} key={role}>
                <Card sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ textTransform: 'capitalize' }}>
                    {role} access
                  </Typography>
                  <Divider sx={{ mb: 1 }} />
                  {modules.map((module) => (
                    <FormControlLabel
                      key={module.key}
                      control={(
                        <Checkbox
                          checked={roleAccess[role]?.has(module.key)}
                          onChange={(event) => {
                            setRoleAccess((prev) => {
                              const next = new Map(Array.from(Object.entries(prev), ([key, value]) => [key, new Set(value)]));
                              const set = next.get(role) || new Set();
                              if (event.target.checked) set.add(module.key);
                              else set.delete(module.key);
                              next.set(role, set);
                              return Object.fromEntries(Array.from(next.entries()));
                            });
                          }}
                        />
                      )}
                      label={module.label}
                    />
                  ))}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default BusinessSettings;
