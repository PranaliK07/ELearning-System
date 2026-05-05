import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    MenuItem,
    CircularProgress,
    IconButton,
    Card,
    CardMedia,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Divider,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CardActionArea,
    Radio,
    FormControlLabel,
    Stack,
    alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import {
    CloudUpload,
    Movie,
    Description,
    Delete,
    Edit,
    Add,
    Quiz as QuizIcon,
    VideoLibrary,
    LibraryBooks,
    RemoveCircleOutline
} from '@mui/icons-material';
import axios from '../../utils/axios';
import toast from 'react-hot-toast';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

const ContentManagement = () => {
    const { contentId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const contentType = searchParams.get('type');
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    
    const [loading, setLoading] = useState(false);
    const [grades, setGrades] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [topics, setTopics] = useState([]);
    const [selectedType, setSelectedType] = useState(contentType || null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        gradeId: '',
        subjectId: '',
        topicId: '',
        isPremium: false,
        isPublished: true,
        timeLimit: 10,
        passingScore: 70,
        maxAttempts: 2
    });

    const [questions, setQuestions] = useState([
        { id: Date.now(), question: '', options: ['', '', '', ''], correctAnswer: '' }
    ]);

    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [readingFile, setReadingFile] = useState(null);
    const [topicDialogOpen, setTopicDialogOpen] = useState(false);
    const [newTopic, setNewTopic] = useState({ name: '' });

    const fetchGrades = useCallback(async () => {
        try {
            const res = await axios.get('/api/grades');
            setGrades(res.data);
        } catch (err) { console.error(err); }
    }, []);

    const fetchSubjects = useCallback(async (gradeId) => {
        try {
            const res = await axios.get(`/api/subjects?gradeId=${gradeId}`);
            setSubjects(res.data);
            setTopics([]);
        } catch (err) { console.error(err); }
    }, []);

    const fetchTopics = useCallback(async (subjectId) => {
        try {
            const res = await axios.get(`/api/topics?subjectId=${subjectId}`);
            setTopics(res.data);
        } catch (err) { console.error(err); }
    }, []);

    useEffect(() => {
        fetchGrades();
    }, [fetchGrades]);

    const fetchContentForEdit = useCallback(async () => {
        if (!contentId || !contentType) return;
        try {
            setLoading(true);
            const endpoint = contentType === 'quiz' ? `/api/quiz/${contentId}` : `/api/content/${contentId}`;
            const res = await axios.get(endpoint);
            const data = res.data;

            setFormData({
                title: data.title || '',
                description: data.description || '',
                gradeId: data.GradeId || data.gradeId || '',
                subjectId: data.SubjectId || data.subjectId || '',
                topicId: data.TopicId || data.topicId || '',
                isPremium: data.isPremium || false,
                isPublished: data.isPublished !== undefined ? data.isPublished : true,
                timeLimit: data.timeLimit || 10,
                passingScore: data.passingScore || 70,
                maxAttempts: data.maxAttempts || 2
            });

            if (contentType === 'quiz' && data.questions) {
                let parsedQuestions = data.questions;
                if (typeof parsedQuestions === 'string') {
                    try { parsedQuestions = JSON.parse(parsedQuestions); } catch (e) { parsedQuestions = []; }
                }
                if (Array.isArray(parsedQuestions)) {
                    setQuestions(parsedQuestions.map((q, idx) => ({
                        id: q.id || idx,
                        question: q.question || '',
                        options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
                        correctAnswer: q.correctAnswer || ''
                    })));
                }
            }
            setSelectedType(contentType);
        } catch (err) {
            console.error('Fetch edit error:', err);
            toast.error('Failed to load content for editing');
        } finally {
            setLoading(false);
        }
    }, [contentId, contentType]);

    useEffect(() => {
        if (contentId) fetchContentForEdit();
    }, [contentId, fetchContentForEdit]);

    useEffect(() => {
        if (formData.gradeId) fetchSubjects(formData.gradeId);
    }, [formData.gradeId, fetchSubjects]);

    useEffect(() => {
        if (formData.subjectId) fetchTopics(formData.subjectId);
    }, [formData.subjectId, fetchTopics]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const name = e.target.name;
        if (name === 'video') setVideoFile(file);
        else if (name === 'reading') setReadingFile(file);
        else if (name === 'thumbnail') setThumbnailFile(file);
    };

    const handleCreateTopic = async () => {
        if (!formData.subjectId) return toast.error('Select a subject first');
        if (!newTopic.name.trim()) return toast.error('Topic name is required');
        try {
            const res = await axios.post('/api/topics', { 
                name: newTopic.name.trim(), 
                subjectId: parseInt(formData.subjectId, 10) 
            });
            toast.success('Topic created');
            await fetchTopics(formData.subjectId);
            setFormData(prev => ({ ...prev, topicId: res.data.id || res.data.topic?.id }));
            setTopicDialogOpen(false);
            setNewTopic({ name: '' });
        } catch (error) { toast.error('Failed to create topic'); }
    };

    const handleAddQuestion = () => {
        setQuestions([...questions, { id: Date.now(), question: '', options: ['', '', '', ''], correctAnswer: '' }]);
    };

    const handleRemoveQuestion = (id) => {
        if (questions.length > 1) {
            setQuestions(questions.filter(q => q.id !== id));
        }
    };

    const handleQuestionChange = (id, field, value) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const handleOptionChange = (questionId, optionIndex, value) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                const newOptions = [...q.options];
                newOptions[optionIndex] = value;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const uploadData = new FormData();
            if (videoFile) uploadData.append('video', videoFile);
            if (readingFile) uploadData.append('reading', readingFile);
            if (thumbnailFile) uploadData.append('thumbnail', thumbnailFile);

            let videoUrl = '', thumbnailUrl = '', readingUrl = '';
            if (videoFile || readingFile || thumbnailFile) {
                const uploadRes = await axios.post('/api/upload/content', uploadData);
                videoUrl = uploadRes.data.videoUrl;
                thumbnailUrl = uploadRes.data.thumbnailUrl;
                readingUrl = uploadRes.data.readingUrl;
            }

            const payload = {
                ...formData,
                type: selectedType,
                videoUrl: videoUrl || undefined,
                thumbnail: thumbnailUrl || undefined,
                readingMaterial: readingUrl || undefined,
                questions: selectedType === 'quiz' ? questions : [],
                TopicId: formData.topicId,
                topicId: formData.topicId, // Send both for compatibility
                gradeId: formData.gradeId,
                subjectId: formData.subjectId,
                passingScore: parseInt(formData.passingScore, 10) || 70,
                timeLimit: parseInt(formData.timeLimit, 10) || 10,
                maxAttempts: parseInt(formData.maxAttempts, 10) || 2
            };

            if (contentId) {
                const endpoint = selectedType === 'quiz' ? `/api/quiz/${contentId}` : `/api/content/${contentId}`;
                await axios.put(endpoint, payload);
                toast.success(`${selectedType.toUpperCase()} Updated!`);
                navigate('/admin/content');
            } else {
                if (selectedType === 'quiz') {
                    await axios.post('/api/quiz', {
                        ...payload,
                        topicId: formData.topicId,
                        questions: questions.map(q => ({
                            question: q.question,
                            options: q.options,
                            correctAnswer: q.correctAnswer
                        }))
                    });
                } else {
                    await axios.post('/api/content', payload);
                }
                toast.success(`${selectedType.toUpperCase()} Published!`);
                setFormData({ 
                    title: '', 
                    description: '', 
                    gradeId: '', 
                    subjectId: '', 
                    topicId: '', 
                    isPremium: false, 
                    isPublished: true,
                    timeLimit: 10,
                    passingScore: 70,
                    maxAttempts: 2
                });
                setQuestions([{ id: Date.now(), question: '', options: ['', '', '', ''], correctAnswer: '' }]);
                setVideoFile(null); setThumbnailFile(null); setReadingFile(null);
                setSelectedType(null);
            }
        } catch (error) {
            console.error('Content post error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save content';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const categoryCards = [
        { id: 'video', title: 'Video Lesson', icon: <VideoLibrary sx={{ fontSize: 40 }} />, color: '#00A389' },
        { id: 'reading', title: 'Study Notes', icon: <LibraryBooks sx={{ fontSize: 40 }} />, color: '#00D09E' },
        { id: 'quiz', title: 'Interactive Quiz', icon: <QuizIcon sx={{ fontSize: 40 }} />, color: '#FF9800' }
    ];

    const selectedTypeMeta = {
        video: {
            title: contentId ? 'Update Video Lesson' : 'Add Video Lesson',
            subtitle: 'Upload your lesson video, attach a thumbnail, and organize it by class, subject, and topic.',
            icon: <VideoLibrary sx={{ fontSize: 26 }} />
        },
        reading: {
            title: contentId ? 'Update Study Notes' : 'Add Study Notes',
            subtitle: 'Add clear reading material with the right class and subject so students can find it quickly.',
            icon: <LibraryBooks sx={{ fontSize: 26 }} />
        },
        quiz: {
            title: contentId ? 'Update Interactive Quiz' : 'Add Interactive Quiz',
            subtitle: 'Build a quick assessment with structured questions, answer options, and scoring settings.',
            icon: <QuizIcon sx={{ fontSize: 26 }} />
        }
    };

    if (!selectedType) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, textAlign: 'center' }}>Learning Content Hub</Typography>

                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {categoryCards.map((card) => (
                        <Grid size={{ xs: 12, md: 4 }} key={card.id}>
                            <Card 
                                sx={{ 
                                    borderRadius: 4, 
                                    borderTop: '6px solid',
                                    borderColor: 'primary.main',
                                    boxShadow: selectedType === card.id ? 12 : 2,
                                    bgcolor: selectedType === card.id ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: 8,
                                        transform: 'translateY(-4px)',
                                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                                    }
                                }}
                            >
                                <CardActionArea onClick={() => setSelectedType(card.id)} sx={{ p: 3, textAlign: 'center' }}>
                                    <Box sx={{ color: isDarkMode ? theme.palette.text.primary : card.color, mb: 1 }}>{card.icon}</Box>
                                    <Typography variant="h6" fontWeight="bold">{card.title}</Typography>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 2 }}><Button onClick={() => setSelectedType(null)}>Back</Button></Box>
            <Paper
                sx={{
                    p: 4,
                    borderRadius: 4,
                    mb: 6,
                    boxShadow: 3,
                    borderTop: '6px solid',
                    borderColor: 'primary.main'
                }}
            >
                <Box
                    sx={{
                        mb: 4,
                        px: { xs: 0.5, sm: 1 },
                        py: { xs: 1.5, sm: 2 },
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: 2
                    }}
                >
                    <Box
                        sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 2.5,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 10px 24px rgba(0,109,91,0.18)'
                        }}
                    >
                        {selectedTypeMeta[selectedType]?.icon}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 900,
                                lineHeight: 1.1,
                                letterSpacing: '-0.03em',
                                fontSize: { xs: '1.65rem', sm: '2rem' },
                                color: 'text.primary'
                            }}
                        >
                            {selectedTypeMeta[selectedType]?.title}
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                mt: 1,
                                maxWidth: 760,
                                color: 'text.secondary',
                                fontWeight: 500
                            }}
                        >
                            {selectedTypeMeta[selectedType]?.subtitle}
                        </Typography>
                    </Box>
                </Box>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField select fullWidth label="Class" value={formData.gradeId} onChange={(e) => setFormData({...formData, gradeId: e.target.value})}>{grades.map(g => <MenuItem key={g.id} value={g.id}>Class {g.level}</MenuItem>)}</TextField></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField select fullWidth label="Subject" value={formData.subjectId} onChange={(e) => setFormData({...formData, subjectId: e.target.value})} disabled={!formData.gradeId}>{subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}</TextField></Grid>
                        <Grid size={{ xs: 12, sm: 9 }}><TextField select fullWidth label="Topic" value={formData.topicId} onChange={(e) => setFormData({...formData, topicId: e.target.value})} disabled={!formData.subjectId}>{topics.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}</TextField></Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                sx={{
                                    height: '56px',
                                    borderTop: '6px solid',
                                    borderColor: 'primary.main',
                                    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                                    '&:hover': {
                                        transform: 'translateY(-3px)',
                                        boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
                                        borderColor: 'primary.main'
                                    }
                                }}
                                startIcon={<Add />}
                                onClick={() => setTopicDialogOpen(true)}
                                disabled={!formData.subjectId}
                            >
                                New Topic
                            </Button>
                        </Grid>
                        <Grid size={12}><TextField fullWidth label="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required /></Grid>

                        {selectedType === 'quiz' ? (
                            <Grid size={12}>
                                <Divider sx={{ my: 3 }} />
                                <Typography variant="h6" gutterBottom fontWeight="bold">MCQ Builder</Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                                    Tip: Write the question in the first box, then add each choice separately. Select the correct answer using the radio button.
                                </Typography>
                                <Grid container spacing={2} sx={{ mb: 4 }}>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField 
                                            fullWidth label="Time Limit (min)" 
                                            type="number" 
                                            value={formData.timeLimit} 
                                            onChange={(e) => setFormData({...formData, timeLimit: e.target.value})} 
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField 
                                            fullWidth label="Passing Score (%)" 
                                            type="number" 
                                            value={formData.passingScore} 
                                            onChange={(e) => setFormData({...formData, passingScore: e.target.value})} 
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField 
                                            fullWidth label="Max Attempts" 
                                            type="number" 
                                            value={formData.maxAttempts} 
                                            onChange={(e) => setFormData({...formData, maxAttempts: e.target.value})} 
                                        />
                                    </Grid>
                                </Grid>
                                <Stack spacing={4}>
                                    {questions.map((q, qIndex) => (
                                        <Card 
                                            key={q.id} 
                                            variant="outlined" 
                                            sx={{ 
                                                p: 3, 
                                                borderRadius: 3, 
                                                position: 'relative',
                                                borderTop: '6px solid',
                                                borderColor: 'primary.main',
                                                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <IconButton 
                                                onClick={() => handleRemoveQuestion(q.id)} 
                                                sx={{ position: 'absolute', top: 10, right: 10 }}
                                                color="error"
                                                disabled={questions.length === 1}
                                            >
                                                <RemoveCircleOutline />
                                            </IconButton>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Question {qIndex + 1}</Typography>
                                            <TextField 
                                                fullWidth label="Write Question" 
                                                value={q.question} 
                                                onChange={(e) => handleQuestionChange(q.id, 'question', e.target.value)}
                                                sx={{ mb: 3 }}
                                            />
                                            <Grid container spacing={2}>
                                                {q.options.map((opt, oIndex) => (
                                                    <Grid size={{ xs: 12, sm: 6 }} key={oIndex} sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Radio 
                                                            checked={q.correctAnswer === opt && opt !== ''} 
                                                            onChange={() => handleQuestionChange(q.id, 'correctAnswer', opt)}
                                                            disabled={!opt}
                                                        />
                                                        <TextField 
                                                            fullWidth label={`Option ${oIndex + 1}`} 
                                                            size="small" 
                                                            value={opt} 
                                                            onChange={(e) => handleOptionChange(q.id, oIndex, e.target.value)}
                                                        />
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Card>
                                    ))}
                                    <Button variant="outlined" startIcon={<Add />} onClick={handleAddQuestion} sx={{ width: 'fit-content' }}>Add More Question</Button>
                                </Stack>
                            </Grid>
                        ) : (
                            <>
                                <Grid size={selectedType === 'video' ? 6 : 12}>
                                    <Button 
                                        variant="outlined" 
                                        component="label" 
                                        fullWidth 
                                        startIcon={<CloudUpload />} 
                                        sx={{ 
                                            height: 100, 
                                            borderTop: '6px solid',
                                            borderRadius: 3,
                                            borderStyle: 'dashed', 
                                            borderWidth: '2px',
                                            borderColor: 'primary.main',
                                            transition: 'transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease',
                                            '&:hover': {
                                                transform: 'translateY(-3px)',
                                                boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
                                                borderWidth: '2px',
                                                borderColor: 'primary.main',
                                                bgcolor: alpha(theme.palette.primary.main, 0.05)
                                            }
                                        }}
                                    >
                                        {selectedType === 'video' ? (videoFile ? videoFile.name : 'Upload Video') : (readingFile ? readingFile.name : 'Upload PDF')}
                                        <input 
                                            type="file" 
                                            hidden 
                                            name={selectedType} 
                                            onChange={handleFileChange} 
                                            accept={selectedType === 'video' ? "video/mp4,video/mpeg,video/quicktime" : ".pdf,.doc,.docx"}
                                        />
                                    </Button>
                                </Grid>
                                {selectedType === 'video' && (
                                    <Grid size={6}>
                                        <Button 
                                            variant="outlined" 
                                            component="label" 
                                            fullWidth 
                                            startIcon={<CloudUpload />} 
                                            sx={{ 
                                                height: 100, 
                                                borderTop: '6px solid',
                                                borderRadius: 3,
                                                borderStyle: 'dashed', 
                                                borderWidth: '2px',
                                                borderColor: 'primary.main',
                                                transition: 'transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-3px)',
                                                    boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
                                                    borderWidth: '2px',
                                                    borderColor: 'primary.main',
                                                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                                                }
                                            }}
                                        >
                                            {thumbnailFile ? thumbnailFile.name : 'Upload Thumbnail'}
                                            <input 
                                                type="file" 
                                                hidden 
                                                name="thumbnail" 
                                                onChange={handleFileChange} 
                                                accept="image/*"
                                            />
                                        </Button>
                                    </Grid>
                                )}
                                <Grid size={12}><TextField fullWidth multiline rows={3} label="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></Grid>
                            </>
                        )}
                        <Grid size={12}><Button variant="contained" type="submit" fullWidth size="large" disabled={loading} sx={{ py: 2 }}>{loading ? <CircularProgress size={24} color="inherit" /> : (contentId ? `Update ${selectedType}` : `Publish ${selectedType}`)}</Button></Grid>
                    </Grid>
                </form>
            </Paper>

            <Dialog 
                open={topicDialogOpen} 
                onClose={() => setTopicDialogOpen(false)}
                PaperProps={{
                    sx: { borderRadius: 4, borderTop: '6px solid', borderColor: 'primary.main', p: 1 }
                }}
            >
                <DialogTitle>Quick Topic Setup</DialogTitle>
                <DialogContent><TextField fullWidth label="Topic Name" sx={{ mt: 2 }} value={newTopic.name} onChange={(e) => setNewTopic({name: e.target.value})} /></DialogContent>
                <DialogActions sx={{ p: 2 }}><Button onClick={() => setTopicDialogOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleCreateTopic}>Add Topic</Button></DialogActions>
            </Dialog>
        </Container>
    );
};

export default ContentManagement;
