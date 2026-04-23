import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const DoubtHistory = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Platform Doubts ❓
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Monitor and manage student-teacher communications.
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <DoubtTable />
      </Paper>
    </Container>
  );
};

const DoubtTable = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDoubtId, setSelectedDoubtId] = useState(null);
  const [responseOpen, setResponseOpen] = useState(false);
  const [currentDoubt, setCurrentDoubt] = useState(null);
  const [answer, setAnswer] = useState('');

  const fetchDoubts = async () => {
    try {
      const res = await api.get('/api/doubts/all');
      setDoubts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  const handleDeleteClick = (id) => {
    setSelectedDoubtId(id);
    setDeleteDialogOpen(true);
  };

  const handleOpenResponse = (doubt) => {
    setCurrentDoubt(doubt);
    setAnswer(doubt.answer || '');
    setResponseOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!answer.trim() || !currentDoubt) return;

    try {
      const res = await api.put(`/api/doubts/${currentDoubt.id}/respond`, { answer });
      const updatedDoubt = res.data?.doubt;
      if (updatedDoubt?.id) {
        setDoubts((prev) => prev.map((doubt) => (
          doubt.id === updatedDoubt.id ? { ...doubt, ...updatedDoubt } : doubt
        )));
      }
      setResponseOpen(false);
      setCurrentDoubt(null);
      setAnswer('');
      toast.success('Response sent successfully');
    } catch (err) {
      console.error('Submit response error', err);
      toast.error(err?.response?.data?.message || 'Failed to send response');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/doubts/${selectedDoubtId}`);
      setDoubts((prev) => prev.filter((d) => d.id !== selectedDoubtId));
      toast.success('Doubt deleted successfully');
    } catch (err) {
      toast.error('Failed to delete doubt');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedDoubtId(null);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <>
      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto', border: 'none', boxShadow: 'none' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Teacher</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Question</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {doubts.map((doubt) => (
              <TableRow key={doubt.id} hover>
                <TableCell>{doubt.student?.name || 'N/A'}</TableCell>
                <TableCell>{doubt.teacher?.name || 'N/A'}</TableCell>
                <TableCell sx={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {doubt.question}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={doubt.status}
                    color={doubt.status === 'resolved' ? 'success' : 'warning'}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      color="primary"
                      variant="outlined"
                      onClick={() => handleOpenResponse(doubt)}
                      sx={{ borderRadius: '8px' }}
                    >
                      {doubt.status === 'resolved' ? 'Edit Answer' : 'Answer'}
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => handleDeleteClick(doubt.id)}
                      sx={{ borderRadius: '8px' }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {doubts.length === 0 && (
          <Typography sx={{ py: 4, textAlign: 'center' }} color="textSecondary">
            No doubts found on the platform.
          </Typography>
        )}
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: '16px', p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Delete Doubt History?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this doubt entry? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ borderRadius: '8px' }}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            sx={{ borderRadius: '8px' }}
            autoFocus
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={responseOpen}
        onClose={() => setResponseOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: isDarkMode ? '#1A2740' : 'background.paper',
            color: 'text.primary'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: 'text.primary' }}>Resolve Doubt</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
            Student Question:
          </Typography>
          <Box
            sx={{
              bgcolor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'grey.100',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
              p: 2,
              borderRadius: 2,
              mb: 3
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              {currentDoubt?.question}
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={5}
            label="Your Answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Provide a clear and helpful explanation..."
            InputLabelProps={{ sx: { color: 'text.secondary' } }}
            sx={{
              '& .MuiInputBase-input': { color: 'text.primary' },
              '& .MuiOutlinedInput-root': {
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : 'transparent'
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setResponseOpen(false)} sx={{ fontWeight: 'bold' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitResponse}
            disabled={!answer.trim()}
            sx={{ borderRadius: 2, fontWeight: 'bold', px: 4 }}
          >
            Send Response
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DoubtHistory;
