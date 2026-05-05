import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    CircularProgress,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    InputAdornment,
    Tooltip,
    Button,
    Avatar,
    Stack,
    Divider,
    alpha,
    useTheme
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
    Delete,
    Edit,
    Search,
    Quiz as QuizIcon,
    School,
    PlayArrow,
    Refresh,
    FilterList
} from '@mui/icons-material';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const QuizManagement = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [quizzes, setQuizzes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmDialog, setConfirmDialog] = useState({ open: false, quizId: null });

    const fetchAllQuizzes = useCallback(async () => {
        try {
            setLoading(true);
            const subjectsRes = await api.get('/api/subjects');
            const subjectRows = Array.isArray(subjectsRes.data) ? subjectsRes.data : [];

            // Flatten quizzes from all subjects and topics for a unified list
            const allQuizzes = await Promise.all(
                subjectRows.map(async (subject) => {
                    try {
                        const topicsRes = await api.get(`/api/subjects/${subject.id}/topics`);
                        const topics = Array.isArray(topicsRes.data) ? topicsRes.data : [];
                        return topics.flatMap(topic => {
                            const qs = Array.isArray(topic.Quizzes) ? topic.Quizzes : [];
                            return qs.map(q => ({
                                ...q,
                                topicName: topic.name,
                                subjectName: subject.name,
                                gradeLevel: subject.Grade?.level
                            }));
                        });
                    } catch (e) { return []; }
                })
            );

            setQuizzes(allQuizzes.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            console.error('Fetch quizzes failed:', error);
            toast.error('Failed to load quizzes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllQuizzes();
    }, [fetchAllQuizzes]);

    const handleDelete = (id) => {
        setConfirmDialog({
            open: true,
            quizId: id
        });
    };

    const processDelete = async () => {
        const id = confirmDialog.quizId;
        try {
            await api.delete(`/api/quiz/${id}`);
            toast.success('Quiz deleted successfully');
            fetchAllQuizzes();
        } catch (err) {
            toast.error('Delete failed');
        } finally {
            setConfirmDialog({ open: false, quizId: null });
        }
    };

    const filteredQuizzes = useMemo(() => {
        return quizzes.filter(q => {
            const search = searchTerm.toLowerCase();
            return (
                (q.title || '').toLowerCase().includes(search) ||
                (q.topicName || '').toLowerCase().includes(search) ||
                (q.subjectName || '').toLowerCase().includes(search) ||
                String(q.gradeLevel || '').includes(search)
            );
        });
    }, [quizzes, searchTerm]);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-end' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>Quiz Management</Typography>
                    <Typography variant="body1" color="textSecondary">Manage all interactive quizzes and student assessments</Typography>
                </Box>
                <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' }, alignItems: 'center' }}>
                    <TextField
                        size="small"
                        placeholder="Search quizzes..."
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
                        variant="outlined" 
                        startIcon={<Refresh />} 
                        onClick={fetchAllQuizzes}
                        sx={{ flex: { xs: 1, sm: '0 0 auto' } }}
                    >
                        Refresh
                    </Button>
                    <Button 
                        variant="contained" 
                        startIcon={<QuizIcon />}
                        onClick={() => navigate('/content/create')}
                        sx={{ flex: { xs: 1, sm: '0 0 auto' } }}
                    >
                        New Quiz
                    </Button>
                </Stack>
            </Box>



            <TableContainer 
                component={Paper} 
                sx={{ 
                    borderRadius: 4, 
                    boxShadow: 3, 
                    overflow: 'hidden', 
                    overflowX: 'auto',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: '0 8px 32px rgba(0, 109, 91, 0.15)',
                        borderColor: 'primary.main'
                    }
                }}
            >
                <Table sx={{ minWidth: 600 }}>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', pl: 3 }}>Quiz Title</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Topic / Subject</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Class</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Questions</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', pr: 3 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                    <CircularProgress size={40} />
                                </TableCell>
                            </TableRow>
                        ) : filteredQuizzes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                    <Typography color="textSecondary">No quizzes found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredQuizzes.map((quiz) => (
                                <TableRow 
                                    key={quiz.id} 
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
                                    <TableCell sx={{ pl: 3 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">{quiz.title}</Typography>
                                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                            Created: {new Date(quiz.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{quiz.topicName}</Typography>
                                        <Chip 
                                            label={quiz.subjectName} 
                                            size="small" 
                                            variant="outlined" 
                                            sx={{ mt: 0.5, fontSize: '0.7rem' }} 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={`Class ${quiz.gradeLevel || 'N/A'}`} 
                                            size="small"
                                            icon={<School sx={{ fontSize: '1rem !important' }} />}
                                            sx={{ bgcolor: '#D18AC4', color: 'white' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="600">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip 
                                                    label={`${Array.isArray(quiz.questions) ? quiz.questions.length : 0} Questions`} 
                                                    size="small" 
                                                    color="primary" 
                                                    variant="outlined" 
                                                />
                                            </Box>
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ pr: 3 }}>
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                            <Tooltip title="Play Preview">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => navigate(`/quiz/${quiz.id}/start`)}
                                                    sx={{ 
                                                        bgcolor: alpha(theme.palette.primary.main, 0.1), 
                                                        color: 'primary.main',
                                                        borderRadius: 1.5,
                                                        '&:hover': { bgcolor: 'primary.main', color: 'white' }
                                                    }}
                                                >
                                                    <PlayArrow fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit Quiz">
                                                <IconButton 
                                                    size="small"
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
                                            <Tooltip title="Delete Quiz">
                                                <IconButton 
                                                    size="small" 
                                                    color="error" 
                                                    onClick={() => handleDelete(quiz.id)}
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
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <ConfirmDialog
                open={confirmDialog.open}
                title="Delete Quiz"
                description="Are you sure you want to delete this quiz? This action cannot be undone."
                onConfirm={processDelete}
                onClose={() => setConfirmDialog({ open: false, quizId: null })}
            />
        </Container>
    );
};

export default QuizManagement;
