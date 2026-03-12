import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Avatar,
    IconButton,
    CircularProgress,
    Paper,
    Divider,
    TextField,
    Button
} from '@mui/material';
import {
    Favorite,
    FavoriteBorder,
    ChatBubbleOutline,
    Share,
    BookmarkBorder,
    MoreHoriz,
    PlayArrow,
    Pause
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const FeedItem = ({ content }) => {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(content.likes || 0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [comment, setComment] = useState('');
    const videoRef = useRef(null);

    const handleToggleLike = async () => {
        try {
            const response = await axios.post(`/api/content/${content.id}/like`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setLiked(response.data.liked);
            setLikesCount(prev => response.data.liked ? prev + 1 : prev - 1);
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    const handleTogglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                mb: 4,
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                maxWidth: 500,
                mx: 'auto'
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                        src={content.creator?.avatar}
                        sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                    >
                        {content.creator?.name?.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {content.creator?.name || 'Admin'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            {content.Topic?.Subject?.name} • {content.Topic?.name}
                        </Typography>
                    </Box>
                </Box>
                <IconButton size="small">
                    <MoreHoriz />
                </IconButton>
            </Box>

            {/* Video Content */}
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    pt: '125%', // 4:5 aspect ratio like Insta
                    bgcolor: 'black'
                }}
                onClick={handleTogglePlay}
            >
                <video
                    ref={videoRef}
                    src={content.videoUrl || content.videoFile}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                    }}
                    loop
                    playsInline
                />
                {!isPlaying && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            bgcolor: 'rgba(0,0,0,0.4)',
                            borderRadius: '50%',
                            p: 2,
                            display: 'flex'
                        }}
                    >
                        <PlayArrow sx={{ color: 'white', fontSize: 40 }} />
                    </Box>
                )}
            </Box>

            {/* Actions */}
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex' }}>
                    <IconButton onClick={handleToggleLike}>
                        {liked ? <Favorite sx={{ color: 'error.main' }} /> : <FavoriteBorder />}
                    </IconButton>
                    <IconButton onClick={() => setShowCommentInput(!showCommentInput)}>
                        <ChatBubbleOutline />
                    </IconButton>
                    <IconButton>
                        <Share />
                    </IconButton>
                </Box>
                <IconButton>
                    <BookmarkBorder />
                </IconButton>
            </Box>

            {/* Likes and Title */}
            <Box sx={{ px: 2, pb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {likesCount} likes
                </Typography>
                <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 700, mr: 1 }}>
                        {content.creator?.name || 'Admin'}
                    </Box>
                    {content.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                    {content.description}
                </Typography>
                <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ mt: 1, display: 'block', textTransform: 'uppercase', fontSize: '10px' }}
                >
                    {formatDistanceToNow(new Date(content.createdAt))} ago
                </Typography>
            </Box>

            {/* Comment Section (Simplified) */}
            {showCommentInput && (
                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        variant="standard"
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        InputProps={{ disableUnderline: true }}
                        sx={{ fontSize: '0.9rem' }}
                    />
                    <Button
                        disabled={!comment.trim()}
                        size="small"
                        sx={{ fontWeight: 600 }}
                    >
                        Post
                    </Button>
                </Box>
            )}
        </Paper>
    );
};

const InstagramFeed = () => {
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/content?type=video', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setContents(response.data.contents);
        } catch (error) {
            console.error('Feed fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={10}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4 }}>
            <AnimatePresence>
                {contents.map((content) => (
                    <motion.div
                        key={content.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                    >
                        <FeedItem content={content} />
                    </motion.div>
                ))}
            </AnimatePresence>
            {contents.length === 0 && (
                <Box textAlign="center" py={10}>
                    <Typography color="textSecondary">No videos uploaded yet! 🎥</Typography>
                </Box>
            )}
        </Box>
    );
};

export default InstagramFeed;
