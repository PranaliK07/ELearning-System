import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Divider,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Add, Edit, Delete, Source as ContentOverviewIcon, Refresh, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import toast from 'react-hot-toast';
import { Search, FilterList } from '@mui/icons-material';
import { FormControl, InputLabel, Select, MenuItem, InputAdornment, TextField } from '@mui/material';

const UploadedContent = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState(null);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const [contentRes, quizRes, gradesRes] = await Promise.all([
        axios.get('/api/content'),
        axios.get('/api/quiz'),
        axios.get('/api/grades')
      ]);

      const contentData = Array.isArray(contentRes.data.contents) 
        ? contentRes.data.contents 
        : (Array.isArray(contentRes.data) ? contentRes.data : []);
        
      const quizData = (Array.isArray(quizRes.data.quizzes) 
        ? quizRes.data.quizzes 
        : (Array.isArray(quizRes.data) ? quizRes.data : [])).map(q => ({
        ...q,
        type: 'quiz'
      }));

      setContent([...contentData, ...quizData]);
      setGrades(gradesRes.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to fetch uploaded content');
      setContent([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleDeleteContent = async () => {
    if (!contentToDelete) return;
    try {
      const endpoint = contentToDelete.type === 'quiz' 
        ? `/api/quiz/${contentToDelete.id}` 
        : `/api/content/${contentToDelete.id}`;
        
      await axios.delete(endpoint);
      setContent((prev) => prev.filter((c) => c.id !== contentToDelete.id || c.type !== contentToDelete.type));
      toast.success('Content deleted successfully');
    } catch (err) {
      toast.error('Failed to delete content');
    } finally {
      setDeleteDialogOpen(false);
      setContentToDelete(null);
    }
  };

  const openDeleteDialog = (item) => {
    setContentToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleView = (item) => {
    if (item.type === 'quiz') {
      navigate(`/quiz/${item.id}/start`);
    } else if (item.type === 'video') {
      navigate(`/play/video/${item.id}`);
    } else {
      // For reading materials, we can show details or open file
      navigate(`/study/content/${item.id}`);
    }
  };

  const handleEdit = (item) => {
    // Both lessons and quizzes are managed in ContentManagement hub
    // Using absolute path from root to avoid nested route issues
    const editPath = `/content/edit/${item.id}?type=${item.type}`;
    navigate(editPath);
  };

  const filteredContent = content.filter(item => {
    const itemGradeId = item.GradeId || item.gradeId;
    const matchesGrade = selectedGrade === 'all' || Number(itemGradeId) === Number(selectedGrade);
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGrade && matchesSearch;
  });

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight="900" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ContentOverviewIcon color="primary" fontSize="large" /> 
            Uploaded Content Hub
          </Typography>
          {!isMobile && <Typography variant="body1" color="textSecondary">Manage all your lessons, notes, and interactive quizzes in one place.</Typography>}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchContent} disabled={loading}>Refresh</Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/content/create')}>New Lesson</Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Class Filter</InputLabel>
          <Select
            value={selectedGrade}
            label="Class Filter"
            onChange={(e) => setSelectedGrade(e.target.value)}
            startAdornment={<FilterList fontSize="small" color="action" sx={{ mr: 1 }} />}
          >
            <MenuItem value="all">All Classes</MenuItem>
            {grades.map(g => (
              <MenuItem key={g.id} value={g.id}>Class {g.level}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Paper sx={{ p: { xs: 1, sm: 3 }, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title & Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  {!isMobile && <TableCell sx={{ fontWeight: 'bold' }}>Target</TableCell>}
                  {!isMobile && <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>}
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredContent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isMobile ? 3 : 5} align="center" sx={{ py: 6 }}>
                        <Typography variant="body1" color="textSecondary">No content matches your filters. Try uploading something new!</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContent.map((item) => (
                    <TableRow key={`${item.type}-${item.id}`} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">{item.title}</Typography>
                        {!isMobile && item.description && (
                          <Typography variant="caption" color="textSecondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                            {item.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.type?.toUpperCase()}
                          size="small"
                          color={item.type === 'video' ? 'primary' : item.type === 'quiz' ? 'warning' : 'info'}
                          variant="outlined"
                        />
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          <Typography variant="body2">{item.Grade ? `Class ${item.Grade.level}` : (item.grade ? `Class ${item.grade}` : 'N/A')}</Typography>
                          <Typography variant="caption" color="textSecondary">{item.Subject?.name || 'No Subject'}</Typography>
                        </TableCell>
                      )}
                      {!isMobile && (
                        <TableCell>
                          <Chip
                            label={item.isPublished ? 'Live' : 'Draft'}
                            size="small"
                            color={item.isPublished ? 'success' : 'default'}
                          />
                        </TableCell>
                      )}
                      <TableCell align="right">
                        <Tooltip title="View"><IconButton size="small" onClick={() => handleView(item)}><Visibility fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEdit(item)}><Edit fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => openDeleteDialog(item)}><Delete fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {content.length > 0 && !loading && (
          <Box sx={{ mt: 5 }}>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>Hub Analytics</Typography>
            <Grid container spacing={2}>
              {[
                { label: 'Videos', count: content.filter(c => c.type === 'video').length, color: theme.palette.primary.main },
                { label: 'Quizzes', count: content.filter(c => c.type === 'quiz').length, color: theme.palette.warning.main },
                { label: 'Study Materials', count: content.filter(c => c.type === 'reading').length, color: theme.palette.info.main },
                { label: 'Published Content', count: content.filter(c => c.isPublished).length, color: theme.palette.success.main }
              ].map((stat, idx) => (
                <Grid item xs={6} sm={3} key={idx}>
                  <Card variant="outlined" sx={{ borderRadius: 3, borderTop: `4px solid ${stat.color}` }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h5" fontWeight="900" sx={{ color: stat.color }}>{stat.count}</Typography>
                      <Typography variant="caption" fontWeight="bold" color="textSecondary">{stat.label}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight="bold">Confirm Removal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this content? This action will remove it permanently for all students.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteContent} variant="contained" color="error" startIcon={<Delete />}>Permanently Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UploadedContent;
