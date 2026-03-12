import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    Grid,
    MenuItem,
    CircularProgress,
    IconButton,
    Card,
    CardMedia,
    LinearProgress
} from '@mui/material';
import {
    CloudUpload,
    Movie,
    Description,
    Quiz,
    ArrowBack,
    Delete,
    CheckCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ContentManagement = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [grades, setGrades] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [topics, setTopics] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        type: 'video',
        description: '',
        gradeId: '',
        subjectId: '',
        topicId: '',
        isPremium: false,
        order: 0
    });

    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);

    useEffect(() => {
        fetchGrades();
    }, []);

    useEffect(() => {
        if (formData.gradeId) fetchSubjects(formData.gradeId);
    }, [formData.gradeId]);

    useEffect(() => {
        if (formData.subjectId) fetchTopics(formData.subjectId);
    }, [formData.subjectId]);

    const fetchGrades = async () => {
        try {
            const res = await axios.get('/api/grades');
            setGrades(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSubjects = async (gradeId) => {
        try {
            const res = await axios.get(`/api/subjects?gradeId=${gradeId}`);
            setSubjects(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTopics = async (subjectId) => {
        try {
            const res = await axios.get(`/api/topics?subjectId=${subjectId}`);
            setTopics(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (e.target.name === 'video') {
            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
        } else {
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile && formData.type === 'video') {
            return toast.error('Please select a video file');
        }

        try {
            setLoading(true);

            const uploadData = new FormData();
            if (videoFile) uploadData.append('video', videoFile);
            if (thumbnailFile) uploadData.append('thumbnail', thumbnailFile);

            // 1. Upload files
            let videoUrl = '';
            let thumbnailUrl = '';

            if (videoFile || thumbnailFile) {
                const uploadRes = await axios.post('/api/upload/content', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(progress);
                    }
                });
                videoUrl = uploadRes.data.videoUrl;
                thumbnailUrl = uploadRes.data.thumbnailUrl;
            }

            // 2. Create content
            await axios.post('/api/content', {
                ...formData,
                videoUrl: videoUrl,
                thumbnail: thumbnailUrl

            });

            toast.success('Content uploaded successfully! 🎉');
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h4">Upload New Content</Typography>
            </Box>

            <Paper sx={{ p: 4, borderRadius: 4 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Content Type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                            >
                                <MenuItem value="video">Video Lesson</MenuItem>
                                <MenuItem value="reading">Reading Material</MenuItem>
                                <MenuItem value="quiz">Quiz</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Class"
                                name="gradeId"
                                value={formData.gradeId}
                                onChange={handleChange}
                                required
                            >
                                {grades.map((g) => (
                                    <MenuItem key={g.id} value={g.id}>Class {g.level} - {g.name}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Subject"
                                name="subjectId"
                                value={formData.subjectId}
                                onChange={handleChange}
                                disabled={!formData.gradeId}
                                required
                            >
                                {subjects.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Topic"
                                name="topicId"
                                value={formData.topicId}
                                onChange={handleChange}
                                disabled={!formData.subjectId}
                                required
                            >
                                {topics.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* Video Upload Section */}
                        {formData.type === 'video' && (
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>Video File</Typography>
                                <Box
                                    sx={{
                                        border: '2px dashed',
                                        borderColor: 'divider',
                                        borderRadius: 2,
                                        p: 4,
                                        textAlign: 'center',
                                        bgcolor: 'background.default',
                                        position: 'relative'
                                    }}
                                >
                                    <input
                                        type="file"
                                        accept="video/*"
                                        style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }}
                                        name="video"
                                        onChange={handleFileChange}
                                    />
                                    {videoPreview ? (
                                        <Box>
                                            <Movie sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                            <Typography>{videoFile.name}</Typography>
                                            <Button size="small" color="error" onClick={() => setVideoPreview(null)}>Remove</Button>
                                        </Box>
                                    ) : (
                                        <Box>
                                            <CloudUpload sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                                            <Typography>Click or drag video file to upload</Typography>
                                            <Typography variant="caption" color="textSecondary">Max size: 100MB</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                        )}

                        {/* Thumbnail Upload */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Thumbnail Image</Typography>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={4}>
                                    {thumbnailPreview ? (
                                        <Card sx={{ position: 'relative' }}>
                                            <CardMedia
                                                component="img"
                                                height="120"
                                                image={thumbnailPreview}
                                            />
                                            <IconButton
                                                size="small"
                                                sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
                                                onClick={() => setThumbnailPreview(null)}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Card>
                                    ) : (
                                        <Box
                                            sx={{
                                                height: 120,
                                                border: '2px dashed',
                                                borderColor: 'divider',
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <CloudUpload sx={{ color: 'text.secondary' }} />
                                        </Box>
                                    )}
                                </Grid>
                                <Grid item xs={12} sm={8}>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        startIcon={<CloudUpload />}
                                    >
                                        Select Thumbnail
                                        <input type="file" hidden accept="image/*" name="thumbnail" onChange={handleFileChange} />
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>

                        {loading && (
                            <Grid item xs={12}>
                                <Box sx={{ width: '100%', mb: 2 }}>
                                    <Typography variant="body2" gutterBottom>Uploading: {uploadProgress}%</Typography>
                                    <LinearProgress variant="determinate" value={uploadProgress} />
                                </Box>
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                size="large"
                                variant="contained"
                                type="submit"
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                            >
                                {loading ? 'Processing...' : 'Create Content'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default ContentManagement;
