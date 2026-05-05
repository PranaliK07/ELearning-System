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
  Tooltip,
  useMediaQuery,
  useTheme,
  Divider,
  alpha,
  InputAdornment,
  Stack
} from '@mui/material';
import { Add, Assignment, Delete, Edit, Visibility, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-hot-toast';
import { resolveUploadSrc } from '../../utils/media';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  validateFutureOrTodayDate,
  validateRequiredText,
  validateSelectRequired
} from '../../utils/validation';

const emptyForm = {
  title: '',
  description: '',
  dueDate: '',
  subjectId: '',
  gradeId: '',
  attachmentUrl: ''
};

const AssignmentManagement = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', onConfirm: () => {} });
  const [isDeletingAll, setIsDeletingAll] = useState(false);

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

  const closeDialog = (force = false) => {
    if (saving && !force) return;
    setOpen(false);
    setEditing(null);
    setFormData(emptyForm);
  };

  const openEdit = (assignment) => {
    setEditing(assignment);
    setFormData({
      title: assignment.title || '',
      description: assignment.description || '',
      dueDate: assignment.dueDate ? assignment.dueDate.slice(0, 10) : '',
      subjectId: assignment.subjectId || '',
      gradeId: assignment.gradeId || '',
      attachmentUrl: assignment.attachmentUrl || ''
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    const nextErrors = {};
    const titleError = validateRequiredText(formData.title, 'Assignment title', 2);
    const subjectError = validateSelectRequired(formData.subjectId, 'Subject');
    const gradeError = validateSelectRequired(formData.gradeId, 'Grade');
    const dueDateError = validateFutureOrTodayDate(formData.dueDate, 'Due date');
    const attachmentError = !formData.attachmentUrl ? 'Please upload an attachment (PDF/Doc/Image)' : '';

    if (titleError) nextErrors.title = titleError;
    if (subjectError) nextErrors.subjectId = subjectError;
    if (gradeError) nextErrors.gradeId = gradeError;
    if (dueDateError) nextErrors.dueDate = dueDateError;
    if (attachmentError) nextErrors.attachment = attachmentError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    const title = formData.title.trim();

    try {
      setSaving(true);
      const payload = {
        ...formData,
        title,
        subjectId: formData.subjectId ? Number(formData.subjectId) : null,
        gradeId: formData.gradeId ? Number(formData.gradeId) : null
      };

      if (editing) {
        await axios.put(`/api/assignments/${editing.id}`, payload);
        toast.success('Assignment updated successfully');
      } else {
        await axios.post('/api/assignments', payload);
        toast.success('Assignment created successfully');
      }

      closeDialog(true);
      await fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save assignment');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAttachment = async (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      toast.error('Upload PDF, DOC, PPT, XLS, or image files');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File must be under 20MB');
      return;
    }

    const form = new FormData();
    form.append('attachment', file);

    try {
      setUploadingFile(true);
      const { data } = await axios.post('/api/upload/assignment', form);
      setFormData((prev) => ({ ...prev, attachmentUrl: data.fileUrl }));
      setErrors((prev) => ({ ...prev, attachment: '' }));
      toast.success('Attachment uploaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDelete = (assignment) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Assignment',
      description: `Are you sure you want to delete "${assignment.title}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/assignments/${assignment.id}`);
          toast.success('Assignment deleted successfully');
          await fetchAssignments();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to delete assignment');
        } finally {
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  const handleBulkDelete = () => {
    setConfirmDialog({
      open: true,
      title: 'Delete ALL Assignments',
      description: 'CRITICAL: This will permanently remove every assignment in the system. Students will lose access to their work. Are you absolutely sure?',
      onConfirm: async () => {
        try {
          setIsDeletingAll(true);
          await axios.delete('/api/assignments/bulk/all');
          toast.success('All assignments cleared');
          await fetchAssignments();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to clear assignments');
        } finally {
          setIsDeletingAll(false);
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssignments = assignments.filter(assignment => {
    const search = searchTerm.toLowerCase();
    const title = (assignment.title || '').toLowerCase();
    const subject = (assignment.Subject?.name || '').toLowerCase();
    const grade = (assignment.Grade?.name || '').toLowerCase();
    const status = (assignment.Submissions?.length || 0) > 0 ? 'completed' : 'pending';

    return (
      title.includes(search) ||
      subject.includes(search) ||
      grade.includes(search) ||
      status.includes(search)
    );
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ 
        mb: 4,
        borderRadius: 3, 
        overflow: 'hidden', 
        p: 0,
        border: '2px solid',
        borderColor: 'primary.main',
        borderTop: '10px solid',
        borderTopColor: 'primary.main',
        boxShadow: '0 14px 34px rgba(0, 109, 91, 0.12)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 18px 40px rgba(0, 109, 91, 0.18)',
          borderColor: 'primary.main'
        }
      }}>
        <Box sx={{ 
          p: 3,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 3
        }}>
          <Box>
            <Typography variant="h4" fontWeight="800" sx={{ color: 'text.primary', letterSpacing: '-0.5px' }}>
              Assignment Management
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              Create, track, and manage student assignments
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={openCreate} 
              sx={{ 
                borderRadius: 3, 
                px: 3, 
                py: 1, 
                textTransform: 'none', 
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0, 109, 91, 0.2)'
              }}
            >
              New Assignment
            </Button>
          </Stack>
        </Box>

        <Box sx={{ px: 3, pb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box
              sx={{
                flex: 1,
                minWidth: 300,
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                px: 1.75,
                py: 0.5,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: '2px solid',
                borderColor: theme.palette.primary.main,
                transition: 'all 0.25s ease',
                '&:focus-within': {
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
                }
              }}
            >
              <Search sx={{ color: 'primary.main', fontSize: 22 }} />
              <TextField
                fullWidth
                size="small"
                placeholder="Search assignments by title, subject, or grade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    py: 0.75,
                    fontSize: '0.98rem',
                    fontWeight: 500
                  },
                  '& input::placeholder': {
                    opacity: 1,
                    color: theme.palette.text.secondary
                  }
                }}
              />
            </Box>
            {assignments.length > 0 && (
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<Delete />} 
                onClick={handleBulkDelete}
                disabled={isDeletingAll}
                sx={{ borderRadius: 3, px: 2, textTransform: 'none', fontWeight: 600 }}
              >
                {isDeletingAll ? 'Clearing...' : 'Delete All'}
              </Button>
            )}
          </Box>
        </Box>

        <Divider />

        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment) => (
                <Paper key={assignment.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">{assignment.title}</Typography>
                    <Chip
                      label={(assignment.Submissions?.length || 0) > 0 ? 'Completed' : 'Pending'}
                      size="small"
                      color={(assignment.Submissions?.length || 0) > 0 ? 'success' : 'warning'}
                    />
                  </Box>
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Subject</Typography>
                      <Typography variant="body2">{assignment.Subject?.name || '-'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Grade</Typography>
                      <Typography variant="body2">{assignment.Grade?.name || '-'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Due Date</Typography>
                      <Typography variant="body2">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '-'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Submissions</Typography>
                      <Typography variant="body2" fontWeight="bold">{assignment.Submissions?.length || 0}</Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {assignment.attachmentUrl && (
                      <Button size="small" variant="outlined" startIcon={<Visibility />} onClick={() => window.open(resolveUploadSrc(assignment.attachmentUrl), '_blank')}>
                        View File
                      </Button>
                    )}
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button size="small" startIcon={<Visibility />} onClick={() => navigate(`/assignments/${assignment.id}/submissions`)}>
                      Submissions
                    </Button>
                    <Box>
                      <IconButton size="small" color="info" onClick={() => openEdit(assignment)}><Edit /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(assignment)}><Delete /></IconButton>
                    </Box>
                  </Box>
                </Paper>
              ))
            ) : (
              <Box textAlign="center" py={4}>
                <Assignment sx={{ fontSize: 48, color: 'divider', mb: 1 }} />
                <Typography color="textSecondary">No assignments found</Typography>
              </Box>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Class</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Attachment</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Submissions</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAssignments.length > 0 ? (
                  filteredAssignments.map((assignment) => (
                    <TableRow 
                      key={assignment.id} 
                      hover 
                      sx={{ 
                        transition: 'all 0.3s ease', 
                        cursor: 'pointer',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                        '&:hover': { 
                          bgcolor: 'rgba(0, 0, 0, 0.04) !important',
                          boxShadow: 'inset 4px 0 0 #006D5B',
                          '& .MuiTableCell-root': {
                            color: 'primary.main'
                          }
                        } 
                      }}
                    >
                      <TableCell><Typography fontWeight="medium">{assignment.title}</Typography></TableCell>
                      <TableCell>{assignment.Subject?.name || '-'}</TableCell>
                      <TableCell>{assignment.Grade?.name || '-'}</TableCell>
                      <TableCell>{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        {assignment.attachmentUrl ? (
                          <Button size="small" variant="text" onClick={() => window.open(assignment.attachmentUrl, '_blank')}>
                            View
                          </Button>
                        ) : (
                          <Typography variant="body2" color="textSecondary">—</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={(assignment.Submissions?.length || 0) > 0 ? 'Completed' : 'Pending'}
                          size="small"
                          color={(assignment.Submissions?.length || 0) > 0 ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {assignment.Submissions?.length || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Tooltip title="View Submissions">
                            <IconButton 
                              onClick={() => navigate(`/assignments/${assignment.id}/submissions`)}
                              sx={{ 
                                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                                color: 'primary.main',
                                borderRadius: 1.5,
                                '&:hover': { bgcolor: 'primary.main', color: 'white' }
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton 
                              onClick={() => openEdit(assignment)}
                              sx={{ 
                                bgcolor: alpha(theme.palette.info.main, 0.1), 
                                color: 'info.main',
                                borderRadius: 1.5,
                                '&:hover': { bgcolor: 'info.main', color: 'white' }
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              color="error" 
                              onClick={() => handleDelete(assignment)}
                              sx={{ 
                                bgcolor: alpha(theme.palette.error.main, 0.1), 
                                borderRadius: 1.5,
                                '&:hover': { bgcolor: 'error.main', color: 'white' }
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Assignment sx={{ fontSize: 64, color: 'divider', mb: 2 }} />
                      <Typography variant="h6" color="textSecondary">No assignments found</Typography>
                      <Button variant="text" onClick={openCreate} sx={{ mt: 1 }}>Create your first assignment</Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Assignment' : 'Create New Assignment'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField label="Assignment Title" fullWidth value={formData.title} onChange={(e) => { setFormData({ ...formData, title: e.target.value }); setErrors((prev) => ({ ...prev, title: '' })); }} error={!!errors.title} helperText={errors.title} />
            <TextField label="Description (Optional)" fullWidth multiline rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select label="Subject" fullWidth value={formData.subjectId} onChange={(e) => { setFormData({ ...formData, subjectId: e.target.value }); setErrors((prev) => ({ ...prev, subjectId: '' })); }} error={!!errors.subjectId} helperText={errors.subjectId}>
                  {subjects.map((sub) => <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select label="Grade" fullWidth value={formData.gradeId} onChange={(e) => { setFormData({ ...formData, gradeId: e.target.value }); setErrors((prev) => ({ ...prev, gradeId: '' })); }} error={!!errors.gradeId} helperText={errors.gradeId}>
                  {grades.map((grade) => <MenuItem key={grade.id} value={grade.id}>{grade.name}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
            <TextField label="Due Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.dueDate} onChange={(e) => { setFormData({ ...formData, dueDate: e.target.value }); setErrors((prev) => ({ ...prev, dueDate: '' })); }} error={!!errors.dueDate} helperText={errors.dueDate} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  disabled={uploadingFile}
                  color={errors.attachment ? 'error' : 'primary'}
                >
                  {uploadingFile ? 'Uploading...' : 'Attach PDF/Doc'}
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg"
                    onChange={(e) => handleUploadAttachment(e.target.files?.[0])}
                  />
                </Button>
                {formData.attachmentUrl && (
                  <>
                    <Button variant="text" onClick={() => window.open(resolveUploadSrc(formData.attachmentUrl), '_blank')}>View current</Button>
                    <Button color="warning" variant="text" onClick={() => {
                      setFormData((prev) => ({ ...prev, attachmentUrl: '' }));
                      setErrors(prev => ({ ...prev, attachment: 'Please upload an attachment (PDF/Doc/Image)' }));
                    }}>Remove</Button>
                  </>
                )}
              </Box>
              {errors.attachment && (
                <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                  {errors.attachment}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      />
    </Container>
  );
};

export default AssignmentManagement;
