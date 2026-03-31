import React from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import { Settings } from '@mui/icons-material';
import { motion } from 'framer-motion';

const SystemSettings = () => {
  return (
    <Container maxWidth="lg">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h4" gutterBottom>
            System Settings
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Review platform controls and monitor current system health.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Platform Settings
                </Typography>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Maintenance Mode</InputLabel>
                  <Select value="off" label="Maintenance Mode">
                    <MenuItem value="on">On</MenuItem>
                    <MenuItem value="off">Off</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Registration</InputLabel>
                  <Select value="open" label="Registration">
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                    <MenuItem value="invite-only">Invite Only</MenuItem>
                  </Select>
                </FormControl>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>
                  System Health
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">CPU Usage</Typography>
                  <LinearProgress variant="determinate" value={45} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">Memory Usage</Typography>
                  <LinearProgress variant="determinate" value={62} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">Storage</Typography>
                  <LinearProgress variant="determinate" value={38} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" startIcon={<Settings />}>
                Save Settings
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default SystemSettings;
