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
  CardContent
} from '@mui/material';
import { Add, Edit, Delete, Source as ContentOverviewIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const ContentOverview = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const contentRes = await api.get('/api/content');

      let contentData = [];

      if (Array.isArray(contentRes.data)) {
        contentData = contentRes.data;
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

  const handleDeleteContent = async (contentId) => {
    try {
      await api.delete(`/api/content/${contentId}`);
      setContent((prev) => prev.filter((c) => c.id !== contentId && c._id !== contentId));
      toast.success('Content deleted successfully');
    } catch (err) {
      toast.error('Failed to delete content');
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <ContentOverviewIcon color="primary" />
            <Typography variant="h6">Content Management</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/content/create')}
          >
            Add Content
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Views/Attempts</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box sx={{ py: 4 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          No content available
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Add />}
                          onClick={() => navigate('/content/create')}
                          sx={{ mt: 1 }}
                        >
                          Create your first content
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  content.map((item) => (
                    <TableRow key={item.id || item._id} hover>
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
                                  : 'secondary'
                          }
                        />
                      </TableCell>
                      <TableCell>{item.grade || item.gradeLevel || 'N/A'}</TableCell>
                      <TableCell>{item.subject || 'N/A'}</TableCell>
                      <TableCell>{item.views || item.attempts || item.downloads || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status || 'draft'}
                          size="small"
                          color={
                            item.status === 'published'
                              ? 'success'
                              : item.status === 'draft'
                                ? 'default'
                                : 'warning'
                          }
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/content/edit/${item.id || item._id}`)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            if (window.confirm('Delete this content? This cannot be undone.')) {
                              handleDeleteContent(item.id || item._id);
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
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
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{content.filter((c) => c.type === 'video' || c.contentType === 'video').length}</Typography>
                    <Typography variant="caption">Videos</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{content.filter((c) => c.type === 'quiz' || c.contentType === 'quiz').length}</Typography>
                    <Typography variant="caption">Quizzes</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{content.filter((c) => c.type === 'assignment' || c.contentType === 'assignment').length}</Typography>
                    <Typography variant="caption">Assignments</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
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
    </Container>
  );
};

export default ContentOverview;
