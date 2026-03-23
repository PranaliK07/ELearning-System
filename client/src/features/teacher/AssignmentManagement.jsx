import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import { Add, Assignment, Delete, Edit, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-hot-toast';

const emptyForm = {
  title: '',
  description: '',
  dueDate: '',
  subjectId: '',
  gradeId: ''
};

const AssignmentManagement = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  async function fetchAssignments() {
    try {
      const response = await axios.get('/api/assignments');
      setAssignments(Array.isArray(response.data) ? response.data : []);
    } catch {
      toast.error('Failed to fetch assignments');
    }
  }

  async function fetchMetadata() {
    try {
      const [subjectsRes, gradesRes] = await Promise.all([axios.get('/api/subjects'), axios.get('/api/grades')]);
      setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
      setGrades(Array.isArray(gradesRes.data) ? gradesRes.data : []);
    } catch {
      toast.error('Failed to fetch metadata');
    }
  }

  useEffect(() => {
    fetchAssignments();
    fetchMetadata();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormData(emptyForm);
    setOpen(true);
  };

  const openEdit = (assignment) => {
    setEditing(assignment);
    setFormData({
      title: assignment.title || '',
      description: assignment.description || '',
      dueDate: assignment.dueDate ? assignment.dueDate.slice(0, 10) : '',
      subjectId: assignment.subjectId || '',
      gradeId: assignment.gradeId || ''
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        subjectId: formData.subjectId ? Number(formData.subjectId) : null,
        gradeId: formData.gradeId ? Number(formData.gradeId) : null
      };

      if (editing) {
        toast.error('Edit API is not available yet. Create a new assignment instead.');
        return;
      }

      await axios.post('/api/assignments', payload);
      toast.success('Assignment created successfully');
      setOpen(false);
      setFormData(emptyForm);
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save assignment');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>Assignments Management</Typography>
          <Typography variant="body1" color="textSecondary">Create and manage assignments for your students</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>New Assignment</Button>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>Title</TableCell>
                <TableCell sx={{ color: 'white' }}>Subject</TableCell>
                <TableCell sx={{ color: 'white' }}>Grade</TableCell>
                <TableCell sx={{ color: 'white' }}>Due Date</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                <TableCell align="right" sx={{ color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <TableRow key={assignment.id} hover>
                    <TableCell><Typography fontWeight="medium">{assignment.title}</Typography></TableCell>
                    <TableCell>{assignment.Subject?.name || '-'}</TableCell>
                    <TableCell>{assignment.Grade?.name || '-'}</TableCell>
                    <TableCell>{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell><Chip label={assignment.status || 'active'} size="small" color={assignment.status === 'active' ? 'success' : 'default'} /></TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Submissions">
                        <IconButton color="primary" onClick={() => navigate(`/assignments/${assignment.id}/submissions`)}><Visibility /></IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton color="info" onClick={() => openEdit(assignment)}><Edit /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" disabled><Delete /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Assignment sx={{ fontSize: 64, color: 'divider', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary">No assignments found</Typography>
                    <Button variant="text" onClick={openCreate} sx={{ mt: 1 }}>Create your first assignment</Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Assignment' : 'Create New Assignment'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField label="Assignment Title" fullWidth value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            <TextField label="Description" fullWidth multiline rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField select label="Subject" fullWidth value={formData.subjectId} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}>
                  {subjects.map((sub) => <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Grade" fullWidth value={formData.gradeId} onChange={(e) => setFormData({ ...formData, gradeId: e.target.value })}>
                  {grades.map((grade) => <MenuItem key={grade.id} value={grade.id}>{grade.name}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
            <TextField label="Due Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AssignmentManagement;
