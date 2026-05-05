import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    CircularProgress,
    IconButton,
    Chip,
    InputAdornment,
    Tooltip,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Avatar,
    Stack,
    Card,
    CardContent,
    CardActions,
    MenuItem
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { alpha, useTheme } from '@mui/material/styles';
import {
    Description as FileIcon,
    Download as DownloadIcon,
    Visibility as ViewIcon,
    Search as SearchIcon,
    ExpandMore,
    School,
    Refresh,
    MenuBook
} from '@mui/icons-material';
import api from '../../utils/axios';
import { resolveUploadSrc } from '../../utils/media';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';

const StudyMaterial = () => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const { user } = useAuth();
    const { updateProgress } = useProgress();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
    const [expandedSubject, setExpandedSubject] = useState(null);

    const fetchStudyMaterials = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch only reading materials (notes)
            const response = await api.get('/api/content?type=reading');
            const data = Array.isArray(response.data.contents) ? response.data.contents : [];
            setMaterials(data);
        } catch (error) {
            console.error('Fetch notes error:', error);
            toast.error('Failed to load notes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudyMaterials();
    }, [fetchStudyMaterials]);

    const trackNoteAccess = async (contentId) => {
        try {
            await updateProgress(contentId, {
                notesDownloaded: true,
                completed: true
            });
        } catch (error) {
            console.error('Track note access error:', error);
        }
    };

    const handleOpen = (url, contentId) => {
        if (!url) return toast.error('File not found');
        trackNoteAccess(contentId);
        window.open(resolveUploadSrc(url), '_blank');
    };

    const handleDownload = async (url, filename) => {
        if (!url) return toast.error('File not found');
        
        try {
            const fullUrl = resolveUploadSrc(url);
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error('Download failed');
            
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', filename || 'notes.pdf');
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
                document.body.removeChild(link);
            }, 100);
            
            toast.success('Download started');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download file');
            // Fallback to simple link if fetch fails (e.g. CORS)
            window.open(resolveUploadSrc(url), '_blank');
        }
    };

    // Group materials by Subject and then by Topic
    const groupedMaterials = useMemo(() => {
        const filtered = materials.filter(item => {
            const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 item.Subject?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 item.Subject?.name?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSubject = selectedSubjectFilter === 'all' || item.Subject?.id?.toString() === selectedSubjectFilter;
            return matchesSearch && matchesSubject;
        });

        const subjectGroups = {};
        filtered.forEach(item => {
            const subjectName = item.Subject?.name || 'General Resources';
            const subjectId = item.Subject?.id || 'general';
            
            if (!subjectGroups[subjectId]) {
                subjectGroups[subjectId] = {
                    name: subjectName,
                    notes: []
                };
            }
            subjectGroups[subjectId].notes.push(item);
        });

        return subjectGroups;
    }, [materials, searchQuery, selectedSubjectFilter]);

    const subjectsList = useMemo(() => {
        const uniqueSubjects = {};
        materials.forEach(m => {
            if (m.Subject) uniqueSubjects[m.Subject.id] = m.Subject.name;
        });
        return Object.entries(uniqueSubjects).map(([id, name]) => ({ id, name }));
    }, [materials]);
    const surfaceBorder = theme.palette.divider;
    const softSurface = theme.palette.background.default;
    const subtleText = theme.palette.text.secondary;
    const iconSurface = alpha(theme.palette.primary.main, isDarkMode ? 0.18 : 0.1);

    return (
        <Box sx={{ py: 4, px: 1 }}>
            <Paper
                sx={{
                    mb: 4,
                    p: { xs: 2, sm: 3 },
                    borderRadius: 4,
                    borderTop: '6px solid',
                    borderColor: 'primary.main',
                    boxShadow: isDarkMode ? 3 : '0 10px 28px rgba(0,0,0,0.06)',
                    bgcolor: 'background.paper'
                }}
            >
                <Box
                    sx={{
                        mb: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 2
                    }}
                >
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Box
                                sx={{
                                    width: 46,
                                    height: 46,
                                    borderRadius: 2.5,
                                    bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.22 : 0.1),
                                    color: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <FileIcon />
                            </Box>
                            <Typography variant="h4" fontWeight="bold" sx={{ color: 'text.primary' }}>
                                Notes
                            </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary">
                            Browse and download study materials {user?.role === 'student' ? 'subject-wise' : 'class-wise'}
                        </Typography>
                    </Box>
                    <Button startIcon={<Refresh />} onClick={fetchStudyMaterials} variant="outlined" sx={{ borderRadius: 2.5 }}>
                        Refresh
                    </Button>
                </Box>

                <Grid container spacing={2} alignItems="stretch">
                    <Grid item xs={12} md={8}>
                        <Paper
                            sx={{
                                p: 1.5,
                                height: '100%',
                                minHeight: 68,
                                borderRadius: 3,
                                borderTop: '6px solid',
                                borderColor: 'primary.main',
                                boxShadow: 'none',
                                border: `1px solid ${surfaceBorder}`,
                                bgcolor: softSurface
                            }}
                        >
                            <TextField
                                fullWidth
                                placeholder="Find specific notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                variant="standard"
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: 40,
                                        fontSize: '1.02rem'
                                    }
                                }}
                                InputProps={{
                                    disableUnderline: true,
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ ml: 1 }}>
                                            <SearchIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            fullWidth
                            label="Filter by Subject"
                            value={selectedSubjectFilter}
                            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                            variant="outlined"
                            sx={{
                                bgcolor: softSurface,
                                borderRadius: 3,
                                '& .MuiOutlinedInput-root': {
                                    minHeight: 68,
                                    borderRadius: 3,
                                    fontSize: '1.02rem',
                                    borderTop: '6px solid',
                                    borderColor: 'primary.main'
                                },
                                '& .MuiInputLabel-root': {
                                    fontSize: '1rem'
                                }
                            }}
                        >
                            <MenuItem value="all">All Subjects</MenuItem>
                            {subjectsList.map(s => (
                                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
            ) : Object.keys(groupedMaterials).length === 0 ? (
                <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, bgcolor: 'background.paper' }}>
                    <FileIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No notes available for the selected filters</Typography>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    {Object.entries(groupedMaterials).map(([subjectId, group]) => (
                        <Accordion 
                            key={subjectId} 
                            expanded={expandedSubject === subjectId}
                            onChange={() => setExpandedSubject(expandedSubject === subjectId ? null : subjectId)}
                            sx={{ 
                                borderRadius: '16px !important', 
                                overflow: 'hidden', 
                                boxShadow: expandedSubject === subjectId ? 4 : 1,
                                border: `1px solid ${surfaceBorder}`,
                                bgcolor: 'background.paper',
                                transition: '0.3s'
                            }}
                        >
                            <AccordionSummary 
                                expandIcon={<ExpandMore color="primary" />} 
                                sx={{ 
                                    background: expandedSubject === subjectId
                                        ? alpha(theme.palette.primary.main, isDarkMode ? 0.14 : 0.06)
                                        : softSurface,
                                    px: 3, 
                                    py: 1,
                                    '&:hover': { bgcolor: theme.palette.action.hover }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    <Avatar sx={{ bgcolor: iconSurface, color: theme.palette.primary.main, boxShadow: isDarkMode ? 2 : '0 4px 10px rgba(15, 118, 110, 0.2)' }}>
                                        {user?.role === 'student' ? <MenuBook /> : <School />}
                                    </Avatar>
                                    <Box flexGrow={1}>
                                        <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary' }}>
                                            {group.name}
                                        </Typography>
                                        <Typography variant="caption" color={subtleText}>
                                            Click to view {group.notes.length} Study Materials
                                        </Typography>
                                    </Box>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ bgcolor: 'background.paper', p: { xs: 2, sm: 4 } }}>
                                <Grid container spacing={3}>
                                    {group.notes.map((item) => (
                                        <Grid item xs={12} md={6} lg={4} key={item.id}>
                                            <Card sx={{ 
                                                height: '100%', 
                                                borderRadius: 3,
                                                transition: 'transform 0.2s',
                                                '&:hover': { transform: 'translateY(-5px)' }
                                            }}>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                        <Chip label={item.Subject?.name || 'General'} size="small" color="primary" variant="outlined" />
                                                        <FileIcon sx={{ color: theme.palette.text.secondary }} />
                                                    </Box>
                                                    <Typography variant="h6" fontWeight="bold" gutterBottom>{item.title}</Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                                        display: '-webkit-box', 
                                                        WebkitLineClamp: 2, 
                                                        WebkitBoxOrient: 'vertical', 
                                                        overflow: 'hidden',
                                                        minHeight: 40 
                                                    }}>
                                                        {item.description || 'Quick access to study materials and notes.'}
                                                    </Typography>
                                                </CardContent>
                                                <CardActions sx={{ p: 2, pt: 0 }}>
                                                    <Button 
                                                        fullWidth 
                                                        variant="contained" 
                                                        startIcon={<ViewIcon />}
                                                        onClick={() => handleOpen(item.readingMaterial, item.id)}
                                                        sx={{ borderRadius: 2 }}
                                                    >
                                                        View PDF
                                                    </Button>
                                                    <Tooltip title="Download">
                                                        <IconButton 
                                                            variant="outlined" 
                                                            onClick={() => handleDownload(item.readingMaterial, `${item.title}.pdf`, item.id)}
                                                            sx={{ borderRadius: 2, border: `1px solid ${surfaceBorder}` }}
                                                        >
                                                            <DownloadIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default StudyMaterial;
