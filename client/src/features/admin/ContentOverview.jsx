import React, { useEffect, useState } from 'react';
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
  useMediaQuery,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import { Add, Edit, Delete, Source as ContentOverviewIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const ContentOverview = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState(null);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const contentRes = await api.get('/api/content');

      let contentData = [];

      if (Array.isArray(contentRes.data)) {
        contentData = contentRes.data;
      } else if (contentRes.data?.contents) {
        contentData = contentRes.data.contents;
      } else if (contentRes.data?.content) {
        contentData = contentRes.data.content;
      } else if (contentRes.data?.data) {
        contentData = contentRes.data.data;
      } else if (contentRes.data?.items) {
        contentData = contentRes.data.items;
      } else if (contentRes.data?.lessons) {
        contentData = contentRes.data.lessons;
      } else if (contentRes.data?.courses) {
        contentData = contentRes.data.courses;
      } else if (contentRes.data?.materials) {
        contentData = contentRes.data.materials;
      } else if (typeof contentRes.data === 'object' && contentRes.data !== null) {
        if (contentRes.data.id || contentRes.data._id) {
          contentData = [contentRes.data];
        }
      }

      setContent(contentData);
    } catch (contentErr) {
      if (contentErr?.response?.status !== 404) {
        toast.error('Failed to fetch content data');
      }
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleDeleteContent = async () => {
    if (!contentToDelete) return;
    try {
      await api.delete(`/api/content/${contentToDelete}`);
      setContent((prev) => prev.filter((c) => c.id !== contentToDelete && c._id !== contentToDelete));
      toast.success('Content deleted successfully');
    } catch (err) {
      toast.error('Failed to delete content');
    } finally {
      setDeleteDialogOpen(false);
      setContentToDelete(null);
    }
  };

  const openDeleteDialog = (id) => {
    setContentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const [searchTerm, setSearchTerm] = useState('');

  const filteredContent = content.filter(item => {
    const search = searchTerm.toLowerCase();
    const gradeStr = item.Grade ? `Class ${item.Grade.level}` : (item.grade || item.gradeLevel || 'N/A');
    const subjectStr = item.Subject?.name || item.subject || 'N/A';
    const statusStr = item.isPublished ? 'published' : (item.status || 'draft');
    const typeStr = item.type || item.contentType || 'unknown';

    return (
      String(item.title || item.name || '').toLowerCase().includes(search) ||
      String(typeStr).toLowerCase().includes(search) ||
      String(gradeStr).toLowerCase().includes(search) ||
      String(subjectStr).toLowerCase().includes(search) ||
      String(statusStr).toLowerCase().includes(search)
    );
  });

  return (
    <Container maxWidth="lg">
      <Paper sx={{ 
        p: { xs: 2, sm: 3 }, 
        borderRadius: 3,
        border: '1px solid rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 32px rgba(0, 109, 91, 0.15)',
          borderColor: 'primary.main'
        }
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <ContentOverviewIcon color="primary" />
            <Typography variant="h6">Content Management</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' }, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search content..."
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
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/content/create')}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Add Content
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : isMobile ? (
          <Box sx={{ display: 'grid', gap: 2 }}>
            {filteredContent.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  No content available
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => navigate('/content/create')}
                  sx={{ mt: 1, width: { xs: '100%', sm: 'auto' } }}
                >
                  Create your first content
                </Button>
              </Paper>
            ) : (
              filteredContent.map((item) => (
                <Paper 
                  key={item.id || item._id} 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                      borderColor: 'primary.main',
                      borderWidth: '2px'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
                          {item.title || item.name || 'Untitled'}
                        </Typography>
                        {item.description && (
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', wordBreak: 'break-word' }}>
                            {item.description.substring(0, 80)}{item.description.length > 80 ? '...' : ''}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label={item.type || item.contentType || 'unknown'}
                        size="small"
                        color={
                          item.type === 'video'
                            ? 'primary'
                            : item.type === 'quiz'
                              ? 'warning'
                              : item.type === 'assignment'
                                ? 'success'
                                : item.type === 'reading'
                                  ? 'info'
                                  : 'secondary'
                        }
                      />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Grade</Typography>
                        <Typography variant="body2">
                          {item.Grade ? `Class ${item.Grade.level}` : (item.grade || item.gradeLevel || 'N/A')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Subject</Typography>
                        <Typography variant="body2" noWrap>
                          {item.Subject?.name || item.subject || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Views/Attempts</Typography>
                        <Typography variant="body2">
                          {item.views || item.attempts || item.downloads || 0}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Status</Typography>
                        <Box>
                          <Chip
                            label={item.isPublished ? 'published' : (item.status || 'draft')}
                            size="small"
                            color={(item.isPublished || item.status === 'published') ? 'success' : 'default'}
                          />
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/content/edit/${item.id || item._id}`)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => openDeleteDialog(item.id || item._id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Views</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredContent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box sx={{ py: 4 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          No content matches your filters
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContent.map((item) => (
                    <TableRow 
                      key={item.id || item._id} 
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
                        <Typography variant="subtitle2">
                          {item.title || item.name || 'Untitled'}
                        </Typography>
                        {item.description && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            {item.description.substring(0, 60)}...
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.type || item.contentType || 'unknown'}
                          size="small"
                          color={
                            item.type === 'video'
                              ? 'primary'
                              : item.type === 'quiz'
                                ? 'warning'
                                : item.type === 'assignment'
                                  ? 'success'
                                  : item.type === 'reading'
                                    ? 'info'
                                    : 'secondary'
                          }
                        />
                      </TableCell>
                      <TableCell>{item.Grade ? `Class ${item.Grade.level}` : (item.grade || item.gradeLevel || 'N/A')}</TableCell>
                      <TableCell>{item.Subject?.name || item.subject || 'N/A'}</TableCell>
                      <TableCell>{item.views || item.attempts || item.downloads || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.isPublished ? 'published' : (item.status || 'draft')}
                          size="small"
                          color={
                            (item.isPublished || item.status === 'published')
                              ? 'success'
                              : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/content/edit/${item.id || item._id}`)}
                            sx={{ 
                              bgcolor: alpha(theme.palette.info.main, 0.1), 
                              color: 'info.main',
                              borderRadius: 1.5,
                              '&:hover': { bgcolor: 'info.main', color: 'white' }
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openDeleteDialog(item.id || item._id)}
                            sx={{ 
                              bgcolor: alpha(theme.palette.error.main, 0.1), 
                              borderRadius: 1.5,
                              '&:hover': { bgcolor: 'error.main', color: 'white' }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {content.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Content Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 2.4 }}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{content.filter((c) => c.type === 'video' || c.contentType === 'video').length}</Typography>
                    <Typography variant="caption">Videos</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 2.4 }}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{content.filter((c) => c.type === 'quiz' || c.contentType === 'quiz').length}</Typography>
                    <Typography variant="caption">Quizzes</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 2.4 }}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{content.filter((c) => c.type === 'assignment' || c.contentType === 'assignment').length}</Typography>
                    <Typography variant="caption">Assignments</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 2.4 }}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{content.filter((c) => c.type === 'reading' || c.contentType === 'reading').length}</Typography>
                    <Typography variant="caption">Notes</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 2.4 }}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{content.filter((c) => c.status === 'published').length}</Typography>
                    <Typography variant="caption">Published</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="delete-dialog-title">
          {"Confirm Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this content? This action cannot be undone and will remove all associated data.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteContent} 
            variant="contained" 
            color="error" 
            autoFocus
            startIcon={<Delete />}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContentOverview;
