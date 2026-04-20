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
  useTheme
} from '@mui/material';
import { Campaign, Send, Delete, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { validateRequiredText } from '../../utils/validation';

const ClassCommunication = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this communication?')) return;
    try {
      await axios.delete(`${basePath}/communications/${id}`);
      toast.success('Communication deleted successfully');
      fetchCommunications();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete communication');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
          {isStudent ? 'Teacher Notice' : 'Class Communication'}
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {!isStudent && (
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Campaign color="primary" />
                  <Typography variant="h6">New Message</Typography>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gap: 2.5,
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: 'repeat(12, minmax(0, 1fr))'
                    }
                  }}
                >
                  <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 3' } }}>
                    <FormControl fullWidth>
                      <InputLabel>Class</InputLabel>
                      <Select
                        label="Class"
                        value={form.gradeId}
                        onChange={(e) => setForm((prev) => ({ ...prev, gradeId: e.target.value }))}
                      >
                        <MenuItem value="">All Classes</MenuItem>
                        {classes.map((grade) => (
                          <MenuItem key={grade.id} value={grade.id}>
                            {grade.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {isAdmin && (
                    <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 4' } }}>
                      <FormControl fullWidth>
                        <InputLabel>Send As</InputLabel>
                        <Select
                          label="Send As"
                          value={form.senderId}
                          onChange={(e) => setForm((prev) => ({ ...prev, senderId: e.target.value }))}
                        >
                          <MenuItem value="—">Admin</MenuItem>
                          {teachers.map((teacher) => (
                            <MenuItem key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  )}

                  <Box
                    sx={{
                      gridColumn: { xs: '1 / -1', md: isAdmin ? 'span 5' : 'span 9' }
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel>Audience</InputLabel>
                      <Select
                        label="Audience"
                        value={form.audience}
                        onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value }))}
                      >
                        <MenuItem value="students">Students</MenuItem>
                        <MenuItem value="parents">Parents</MenuItem>
                        <MenuItem value="both">Students + Parents</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 6' } }}>
                    <TextField
                      fullWidth
                      label="Title"
                      value={form.title}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, title: e.target.value }));
                        setErrors((prev) => ({ ...prev, title: '' }));
                      }}
                      error={!!errors.title}
                      helperText={errors.title}
                    />
                  </Box>
                  <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 6' } }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={5}
                      label="Message"
                      value={form.message}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, message: e.target.value }));
                        setErrors((prev) => ({ ...prev, message: '' }));
                      }}
                      error={!!errors.message}
                      helperText={errors.message}
                    />
                  </Box>
                  <Box sx={{ gridColumn: { xs: '1 / -1', md: '1 / span 3' } }}>
                    <Button
                      variant="contained"
                      startIcon={<Send />}
                      onClick={handleSend}
                      disabled={sending}
                      sx={{
                        minHeight: 48,
                        px: 3,
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      {sending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12} md={isStudent ? 12 : 7}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {isStudent ? 'Notices' : 'Communication History'}
            </Typography>

            {!canViewHistory ? (
              <Typography variant="body2" color="textSecondary">
                Communication history is available to admins only.
              </Typography>
            ) : (
              <>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {!isStudent && (
                    <>
                      <Grid item xs={12} sm={6} md={isAdmin ? 3 : 4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Class</InputLabel>
                          <Select
                            label="Class"
                            value={filters.gradeId}
                            onChange={(e) => setFilters((prev) => ({ ...prev, gradeId: e.target.value }))}
                            sx={{ minWidth: 120 }}
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

                      {isAdmin && (
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Teacher</InputLabel>
                            <Select
                              label="Teacher"
                              value={filters.teacherId}
                              onChange={(e) => setFilters((prev) => ({ ...prev, teacherId: e.target.value }))}
                              sx={{ minWidth: 120 }}
                            >
                              <MenuItem value="">All Teachers</MenuItem>
                              {teachers.map((teacher) => (
                                <MenuItem key={teacher.id} value={teacher.id}>
                                  {teacher.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      )}

                      <Grid item xs={12} sm={6} md={isAdmin ? 3 : 4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Audience</InputLabel>
                          <Select
                            label="Audience"
                            value={filters.audience}
                            onChange={(e) => setFilters((prev) => ({ ...prev, audience: e.target.value }))}
                            sx={{ minWidth: 120 }}
                          >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="students">Students</MenuItem>
                            <MenuItem value="parents">Parents</MenuItem>
                            <MenuItem value="both">Students + Parents</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12} md={isStudent ? 12 : (isAdmin ? 3 : 4)}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search notices..."
                      value={filters.search}
                      onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: isStudent ? '30px' : '12px'
                        }
                      }}
                    />
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
                          backgroundColor: 'rgba(11, 31, 59, 0.02)',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'rgba(11, 31, 59, 0.05)' }
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
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Class</TableCell>
                        <TableCell>Audience</TableCell>
                        <TableCell>Recipients</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCommunications.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2">{item.title}</Typography>
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                              {item.message?.slice(0, 50)}
                              {item.message?.length > 50 ? '...' : ''}
                            </Typography>
                            {!isAdmin && (
                              <Typography variant="caption" color="textSecondary">
                                From: {item.teacher?.name || '—'}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{item.Grade?.name || 'All Classes'}</TableCell>
                          <TableCell>
                            <Chip
                              label={audienceLabel[item.audience] || item.audience}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{item.recipientCount || 0}</TableCell>
                          <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell align="right">
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
    </Container>
  );
};

export default ClassCommunication;
