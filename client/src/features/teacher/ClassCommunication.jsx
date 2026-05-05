import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Divider,
  alpha,
  Stack,
  CircularProgress
} from '@mui/material';
import { Campaign, Send, Delete, Visibility, School, People } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { validateRequiredText } from '../../utils/validation';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { isAdminLikeRole } from '../../utils/roles';

const ClassCommunication = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = isAdminLikeRole(user?.role);
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const canViewHistory = isAdmin || isTeacher || isStudent;
  const basePath = isAdmin ? '/api/admin' : '/api/teacher';

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  const [filters, setFilters] = useState({
    gradeId: '',
    teacherId: '',
    audience: '',
    search: ''
  });

  const [form, setForm] = useState({
    gradeId: '',
    senderId: '—',
    audience: 'both',
    title: '',
    message: ''
  });

  const audienceLabel = useMemo(() => ({
    students: 'Students',
    parents: 'Parents',
    both: 'Students + Parents'
  }), []);

  const fetchReferenceData = async () => {
    if (!isAdmin && !isTeacher) return;
    try {
      const [classesRes, teachersRes] = await Promise.all([
        axios.get(isAdmin ? '/api/grades' : `${basePath}/classes`),
        isAdmin ? axios.get('/api/users/teachers') : Promise.resolve({ data: [] })
      ]);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      setTeachers(Array.isArray(teachersRes?.data) ? teachersRes.data : []);
    } catch (error) {
      toast.error('Failed to load communication module');
    }
  };

  useEffect(() => {
    fetchReferenceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, isStudent]);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      let url = `${basePath}/communications`;
      const params = {
        gradeId: filters.gradeId || undefined,
        teacherId: isAdmin ? (filters.teacherId || undefined) : undefined,
        audience: filters.audience || undefined,
        limit: 100
      };

      // Force students and any other non-admin/non-teacher users to use the feed endpoint
      if (!isTeacher && !isAdmin) {
        url = '/api/teacher/communications/feed';
      }

      const response = await axios.get(url, { params });
      setCommunications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Failed to load communication history');
      setCommunications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath, canViewHistory, isAdmin, isStudent, filters.gradeId, filters.teacherId, filters.audience]);

  const filteredCommunications = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    if (!query) return communications;
    return communications.filter((item) => {
      const title = String(item?.title || '').toLowerCase();
      const message = String(item?.message || '').toLowerCase();
      const className = String(item?.Grade?.name || '').toLowerCase();
      const senderName = String(item?.teacher?.name || item?.teacher?.email || '').toLowerCase();
      return (
        title.includes(query) ||
        message.includes(query) ||
        className.includes(query) ||
        senderName.includes(query) ||
        String(item?.audience || '').toLowerCase().includes(query) ||
        String(item?.recipientCount || 0).toLowerCase().includes(query) ||
        new Date(item.createdAt).toLocaleDateString().toLowerCase().includes(query) ||
        message.includes(query) ||
        className.includes(query) ||
        senderName.includes(query)
      );
    });
  }, [communications, filters.search]);

  const handleSend = async () => {
    const nextErrors = {};
    const titleError = validateRequiredText(form.title, 'Title', 2);
    const messageError = validateRequiredText(form.message, 'Message', 5);
    if (titleError) nextErrors.title = titleError;
    if (messageError) nextErrors.message = messageError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    if (!isTeacher && !isAdmin) {
      toast.error('You are not allowed to send communications');
      return;
    }

    try {
      setSending(true);
      const payload = {
        gradeId: form.gradeId || null,
        audience: form.audience,
        title: form.title.trim(),
        message: form.message.trim()
      };

      if (isAdmin && form.senderId && form.senderId !== '—') {
        payload.senderId = form.senderId;
      }

      const response = await axios.post(`${basePath}/communications`, payload);
      toast.success(response?.data?.message || 'Message sent successfully');

      setForm((prev) => ({ ...prev, title: '', message: '' }));
      if (canViewHistory) {
        await fetchCommunications();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const processDelete = async () => {
    const id = confirmDialog.id;
    try {
      await axios.delete(`${basePath}/communications/${id}`);
      toast.success('Communication deleted successfully');
      fetchCommunications();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete communication');
    } finally {
      setConfirmDialog({ open: false, id: null });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Paper sx={{ 
        p: { xs: 2, sm: 4, md: 6 }, 
        borderRadius: { xs: 3, sm: 5 }, 
        bgcolor: '#f8fdfc',
        border: '2px solid',
        borderColor: 'primary.main',
        borderTop: '10px solid',
        borderTopColor: 'primary.main',
        boxShadow: '0 14px 34px rgba(0, 109, 91, 0.12)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 18px 40px rgba(0, 109, 91, 0.18)',
          transform: 'translateY(-2px)'
        }
      }}>
        {/* Module Header */}
        <Box sx={{ 
          mb: { xs: 4, sm: 6 }, 
          pb: { xs: 2, sm: 4 },
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: { xs: 1, sm: 3 }
        }}>
          <Box>
            <Typography 
              variant="h3" 
              fontWeight="900" 
              sx={{ 
                color: 'text.primary', 
                letterSpacing: '-1.5px', 
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2.4rem', md: '3rem' }
              }}
            >
              Class Communication 💬
            </Typography>
            <Typography 
              variant="body1" 
              color="textSecondary" 
              sx={{ 
                fontWeight: 500, 
                opacity: 0.8,
                fontSize: { xs: '0.85rem', sm: '1rem' }
              }}
            >
              {isStudent ? 'Stay updated with the latest messages from your teachers' : 'Broadcast messages and announcements to your classes'}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={4} alignItems="stretch">
          {!isStudent && (
            <Grid item xs={12} lg={5}>
            <Card sx={{ 
                borderRadius: 4, 
                boxShadow: '0 14px 34px rgba(0, 109, 91, 0.12)',
                bgcolor: '#ffffff',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="800" sx={{ color: 'primary.main' }}>
                  {isAdmin ? 'Administrative Broadcast' : 'Send Class Message'}
                </Typography>
              </Box>
              <CardContent sx={{ p: 5 }}>
                <Stack spacing={4}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <School fontSize="small" color="primary" /> Target Class
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={form.gradeId}
                          onChange={(e) => setForm((prev) => ({ ...prev, gradeId: e.target.value }))}
                          displayEmpty
                          sx={{ borderRadius: 3, bgcolor: 'action.hover', '& fieldset': { border: 'none' } }}
                        >
                          <MenuItem value="">All Classes (Broadcast)</MenuItem>
                          {classes.map((grade) => (
                            <MenuItem key={grade.id} value={grade.id}>
                              {grade.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <People fontSize="small" color="primary" /> Target Audience
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={form.audience}
                          onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value }))}
                          sx={{ borderRadius: 3, bgcolor: 'action.hover', '& fieldset': { border: 'none' } }}
                        >
                          <MenuItem value="students">Students Only</MenuItem>
                          <MenuItem value="parents">Parents Only</MenuItem>
                          <MenuItem value="both">Students & Parents</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  {isAdmin && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
                        Send Message As
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={form.senderId}
                          onChange={(e) => setForm((prev) => ({ ...prev, senderId: e.target.value }))}
                          sx={{ borderRadius: 3, bgcolor: 'action.hover', '& fieldset': { border: 'none' } }}
                        >
                          <MenuItem value="—">Administrator</MenuItem>
                          {teachers.map((teacher) => (
                            <MenuItem key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
                      Notice Title
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="e.g., Upcoming Science Fair"
                      value={form.title}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, title: e.target.value }));
                        setErrors((prev) => ({ ...prev, title: '' }));
                      }}
                      error={!!errors.title}
                      helperText={errors.title}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'action.hover', '& fieldset': { border: 'none' } } }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
                      Message Content
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      minRows={5}
                      placeholder="Type your detailed message here..."
                      value={form.message}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, message: e.target.value }));
                        setErrors((prev) => ({ ...prev, message: '' }));
                      }}
                      error={!!errors.message}
                      helperText={errors.message}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'action.hover', '& fieldset': { border: 'none' } } }}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <Send />}
                    onClick={handleSend}
                    disabled={sending}
                    fullWidth
                    sx={{
                      height: 56,
                      borderRadius: 3,
                      fontWeight: 800,
                      fontSize: '1rem',
                      textTransform: 'none',
                      boxShadow: '0 8px 24px rgba(0, 109, 91, 0.25)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: '0 12px 32px rgba(0, 109, 91, 0.35)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    {sending ? 'Processing Broadcast...' : 'Broadcast Message Now'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12} lg={!isStudent ? 7 : 12}>
          <Paper sx={{ 
            p: { xs: 2.5, sm: 4 }, 
            borderRadius: 4, 
            bgcolor: '#ffffff',
            boxShadow: '0 14px 34px rgba(0, 109, 91, 0.12)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 18px 40px rgba(0, 109, 91, 0.18)',
              transform: 'translateY(-4px)'
            }
          }}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h6" fontWeight="900">
                  {isStudent ? 'Platform Notices 📚' : 'Communication History 📜'}
                </Typography>
                <Chip label={filteredCommunications.length} size="small" color="primary" sx={{ fontWeight: 800, borderRadius: 1.5 }} />
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                View and manage previously sent messages
              </Typography>
            </Box>

            {!canViewHistory ? (
              <Typography variant="body2" color="textSecondary">
                Communication history is available to admins only.
              </Typography>
            ) : (
              <>
                <Grid container spacing={2.5} sx={{ mb: 4 }}>
                  {!isStudent && (
                    <>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <Typography variant="caption" sx={{ mb: 0.5, ml: 0.5, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Filter by Class
                          </Typography>
                          <Select
                            value={filters.gradeId}
                            onChange={(e) => setFilters((prev) => ({ ...prev, gradeId: e.target.value }))}
                            displayEmpty
                            sx={{ borderRadius: 3, bgcolor: 'action.hover', '& fieldset': { border: 'none' } }}
                          >
                            <MenuItem value="">All Classes</MenuItem>
                            {classes.map((grade) => (
                              <MenuItem key={grade.id} value={grade.id}>
                                {grade.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <Typography variant="caption" sx={{ mb: 0.5, ml: 0.5, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Target Audience
                          </Typography>
                          <Select
                            value={filters.audience}
                            onChange={(e) => setFilters((prev) => ({ ...prev, audience: e.target.value }))}
                            displayEmpty
                            sx={{ borderRadius: 3, bgcolor: 'action.hover', '& fieldset': { border: 'none' } }}
                          >
                            <MenuItem value="">Every Audience</MenuItem>
                            <MenuItem value="students">Students Only</MenuItem>
                            <MenuItem value="parents">Parents Only</MenuItem>
                            <MenuItem value="both">Both</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12} sm={isStudent ? 12 : 4}>
                    <FormControl fullWidth size="small">
                      <Typography variant="caption" sx={{ mb: 0.5, ml: 0.5, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Search Content
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Search notices..."
                        value={filters.search}
                        onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'action.hover', '& fieldset': { border: 'none' } } }}
                      />
                    </FormControl>
                  </Grid>
                </Grid>

                {loading ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="textSecondary">Loading notices...</Typography>
                  </Box>
                ) : filteredCommunications.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="textSecondary">No notices yet</Typography>
                  </Box>
                ) : isStudent ? (
                  <Box sx={{ display: 'grid', gap: 2.5 }}>
                    {filteredCommunications.map((item) => (
                      <Paper 
                        key={item.id} 
                        variant="outlined" 
                        sx={{ 
                          p: 3, 
                          borderRadius: 3,
                          borderColor: 'primary.light',
                          borderWidth: 1.5,
                          backgroundColor: 'rgba(106, 27, 154, 0.02)',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'rgba(106, 27, 154, 0.05)' }
                        }}
                        onClick={() => navigate(`/communications/${item.id}`)}
                      >
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 800, mb: 1 }}>
                          Message
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          Class: {item.Grade?.name || 'All Classes'} • {new Date(item.createdAt).toLocaleString()}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                          {item.message}
                        </Typography>
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                          From: {item.teacher?.name || 'Teacher'}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                ) : isMobile ? (
                  <Box sx={{ display: 'grid', gap: 1.5 }}>
                    {filteredCommunications.map((item) => (
                      <Paper key={item.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
                                {item.title}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', wordBreak: 'break-word' }}>
                                {item.message?.slice(0, 80)}
                                {item.message?.length > 80 ? '...' : ''}
                              </Typography>
                              {!isAdmin && (
                                <Typography variant="caption" color="textSecondary">
                                  From: {item.teacher?.name || '-'}
                                </Typography>
                              )}
                            </Box>
                            <Chip
                              label={audienceLabel[item.audience] || item.audience}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>

                          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
                            <Box>
                              <Typography variant="caption" color="textSecondary">Class</Typography>
                              <Typography variant="body2">{item.Grade?.name || 'All Classes'}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="textSecondary">Recipients</Typography>
                              <Typography variant="body2">{item.recipientCount || 0}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="textSecondary">Date</Typography>
                              <Typography variant="body2">{new Date(item.createdAt).toLocaleDateString()}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="textSecondary">Actions</Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => navigate(`/communications/${item.id}`)}
                                  title="View Details"
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                                {(isAdmin || (isTeacher && item.teacherId === user.id)) && (
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDelete(item.id)}
                                    title="Delete"
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                ) : (
                    <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
                      <Table>
                        <TableHead sx={{ bgcolor: 'action.hover' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>Title</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Class</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Audience</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Recipients</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredCommunications.map((item) => (
                            <TableRow 
                              key={item.id} 
                              hover 
                              sx={{ 
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                                transition: 'background-color 0.2s'
                              }}
                            >
                              <TableCell sx={{ py: 3 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>{item.title}</Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5, lineHeight: 1.4 }}>
                                  {item.message?.slice(0, 120)}
                                  {item.message?.length > 120 ? '...' : ''}
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', px: 1, py: 0.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                                  From: {item.teacher?.name || 'Vaishnavi vv Sirsat'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{item.Grade?.name || 'Global'}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                  {audienceLabel[item.audience] || item.audience}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={700}>{item.recipientCount || 0}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  {new Date(item.createdAt).toLocaleDateString()}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  <IconButton
                                    size="small"
                                    onClick={() => navigate(`/communications/${item.id}`)}
                                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), color: 'primary.main' }}
                                  >
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                  {(isAdmin || (isTeacher && item.teacherId === user.id)) && (
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDelete(item.id)}
                                      sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  )}
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Paper>

      <ConfirmDialog
        open={confirmDialog.open}
        title="Delete Communication"
        description="Are you sure you want to delete this communication? This action cannot be undone."
        onConfirm={processDelete}
        onClose={() => setConfirmDialog({ open: false, id: null })}
      />
    </Container>
  );
};

export default ClassCommunication;
