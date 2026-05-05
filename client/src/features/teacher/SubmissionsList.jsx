import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
  Grid,
  InputAdornment,
  alpha
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, Grade, Search } from '@mui/icons-material';
import axios from '../../utils/axios.js';
import { toast } from 'react-hot-toast';
import { resolveAvatarSrc, resolveUploadSrc } from '../../utils/media';

const SubmissionsList = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });

  async function fetchSubmissions() {
    try {
      const [submissionsRes, assignmentRes] = await Promise.all([
        axios.get(`/api/assignments/${assignmentId}/submissions`),
        axios.get(`/api/assignments/${assignmentId}`)
      ]);
      setSubmissions(Array.isArray(submissionsRes.data) ? submissionsRes.data : []);
      setAssignment(assignmentRes.data || null);
    } catch {
      toast.error('Failed to fetch submissions');
    }
  }

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const handleGrade = async () => {
    try {
      await axios.put(`/api/assignments/submissions/${selectedSubmission.id}/grade`, gradeData);
      toast.success('Graded successfully');
      setOpen(false);
      fetchSubmissions();
    } catch {
      toast.error('Failed to save grade');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubmissions = submissions.filter(sub => {
    const search = searchTerm.toLowerCase();
    const student = (sub.student?.name || '').toLowerCase();
    const email = (sub.student?.email || '').toLowerCase();
    const status = (sub.status || '').toLowerCase();

    return (
      student.includes(search) ||
      email.includes(search) ||
      status.includes(search) ||
      String(sub.assignment?.gradeId || '').toLowerCase().includes(search) ||
      `class ${sub.assignment?.gradeId || ''}`.toLowerCase().includes(search)
    );
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mt: isMobile ? 0 : 1 }}><ArrowBack /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
            Submissions: {assignment?.title || 'Loading...'}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Review and grade student submissions
          </Typography>
        </Box>
        <Box sx={{ mt: isMobile ? 2 : 1 }}>
          <TextField
            size="small"
            placeholder="Search student or class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250, bgcolor: 'background.paper', borderRadius: 1 }}
          />
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', p: isMobile ? 2 : 0 }}>
        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredSubmissions.map((sub) => (
              <Paper key={sub.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2 }} src={resolveAvatarSrc(sub.student?.avatar)}>{sub.student?.name?.charAt(0)}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight="bold">{sub.student?.name}</Typography>
                    <Typography variant="caption" color="textSecondary">{sub.student?.email}</Typography>
                  </Box>
                  <Chip 
                    label={sub.status} 
                    size="small" 
                    color={sub.status === 'graded' ? 'success' : 'warning'} 
                  />
                </Box>
                
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Submitted</Typography>
                    <Typography variant="body2">{new Date(sub.submittedAt).toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Grade</Typography>
                    <Typography variant="body2">{sub.grade ? `${sub.grade}/100` : 'Not graded'}</Typography>
                  </Grid>
                </Grid>

                {sub.fileUrl && (
                  <Button size="small" variant="outlined" fullWidth sx={{ mb: 2 }} onClick={() => window.open(resolveUploadSrc(sub.fileUrl), '_blank')}>
                    View Attachment
                  </Button>
                )}

                <Divider sx={{ my: 1.5 }} />
                
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Grade />}
                  onClick={() => {
                    setSelectedSubmission(sub);
                    setGradeData({ grade: sub.grade || '', feedback: sub.feedback || '' });
                    setOpen(true);
                  }}
                >
                  Grade
                </Button>
              </Paper>
            ))}
            {filteredSubmissions.length === 0 && (
              <Box textAlign="center" py={4}>
                <Typography color="textSecondary">No submissions match your filters</Typography>
              </Box>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Submitted Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Attachment</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubmissions.map((sub) => (
                  <TableRow 
                    key={sub.id} 
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
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }} src={resolveAvatarSrc(sub.student?.avatar)}>{sub.student?.name?.charAt(0)}</Avatar>
                        <Box>
                          <Typography fontWeight="medium">{sub.student?.name}</Typography>
                          <Typography variant="caption" color="textSecondary">{sub.student?.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{new Date(sub.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {sub.fileUrl ? (
                        <Button size="small" variant="text" onClick={() => window.open(resolveUploadSrc(sub.fileUrl), '_blank')}>
                          Open
                        </Button>
                      ) : (
                        <Typography variant="body2" color="textSecondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={sub.status} 
                        size="small" 
                        color={sub.status === 'graded' ? 'success' : 'warning'} 
                      />
                    </TableCell>
                    <TableCell>{sub.grade ? `${sub.grade}/100` : 'Not graded'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sub.feedback || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        startIcon={<Grade />}
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setGradeData({ grade: sub.grade || '', feedback: sub.feedback || '' });
                          setOpen(true);
                        }}
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.1), 
                          color: 'primary.main',
                          borderRadius: 2,
                          px: 3,
                          '&:hover': { bgcolor: 'primary.main', color: 'white' }
                        }}
                      >
                        Grade
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {submissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Typography color="textSecondary">No submissions yet</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Grade Submission - {selectedSubmission?.student?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {selectedSubmission?.content && (
              <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Student Content:</Typography>
                <Typography variant="body2">{selectedSubmission.content}</Typography>
              </Box>
            )}
            {selectedSubmission?.fileUrl && (
              <Button variant="outlined" onClick={() => window.open(resolveUploadSrc(selectedSubmission.fileUrl), '_blank')}>
                View uploaded file
              </Button>
            )}
            <TextField
              label="Grade (out of 100)"
              type="number"
              fullWidth
              value={gradeData.grade}
              onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
            />
            <TextField
              label="Feedback"
              multiline
              rows={4}
              fullWidth
              value={gradeData.feedback}
              onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleGrade}>Submit Grade</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubmissionsList;
