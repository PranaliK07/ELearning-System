import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  IconButton,
  Slider,
  CircularProgress,
  Button
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  SkipNext,
  SkipPrevious,
  Speed
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';
import { useProgress } from '../../context/ProgressContext';
import axios from 'axios';
import { formatTime } from '../../utils/helpers';

const VideoView = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const { updateProgress } = useProgress();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  
  const playerRef = useRef(null);
  const watchTimeInterval = useRef(null);

  useEffect(() => {
    fetchContent();
  }, [contentId]);

  useEffect(() => {
    if (playing) {
      startWatchTimeTracking();
    } else {
      stopWatchTimeTracking();
    }
    
    return () => {
      stopWatchTimeTracking();
    };
  }, [playing]);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`/api/content/content/${contentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setContent(response.data);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const startWatchTimeTracking = () => {
    watchTimeInterval.current = setInterval(() => {
      setWatchTime(prev => prev + 1);
    }, 60000); // Update every minute
  };

  const stopWatchTimeTracking = () => {
    if (watchTimeInterval.current) {
      clearInterval(watchTimeInterval.current);
    }
  };

  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  const handleSeekChange = (e, newValue) => {
    setPlayed(newValue);
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (e, newValue) => {
    setSeeking(false);
    playerRef.current.seekTo(newValue);
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleVolumeChange = (e, newValue) => {
    setVolume(newValue);
  };

  const handleMute = () => {
    setMuted(!muted);
  };

  const handleFullscreen = () => {
    const player = playerRef.current.wrapper;
    if (player.requestFullscreen) {
      player.requestFullscreen();
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed);
    setShowSpeedMenu(false);
  };

  const handleVideoEnd = async () => {
    setPlaying(false);
    await updateProgress(contentId, {
      completed: true,
      watchTime: Math.round(duration * played)
    });
  };

  const handleNext = () => {
    // Navigate to next video in playlist
  };

  const handlePrevious = () => {
    // Navigate to previous video in playlist
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderRadius: 4,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
            <ReactPlayer
              ref={playerRef}
              url={content?.videoUrl || 'https://www.youtube.com/watch?v=LXb3EKWsInQ'}
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
              playing={playing}
              volume={volume}
              muted={muted}
              playbackRate={playbackRate}
              onProgress={handleProgress}
              onDuration={handleDuration}
              onEnded={handleVideoEnd}
              config={{
                youtube: {
                  playerVars: { showinfo: 1 }
                }
              }}
            />
          </Box>

          {/* Custom Controls */}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ minWidth: 45 }}>
                {formatTime(duration * played)}
              </Typography>
              <Slider
                value={played}
                min={0}
                max={1}
                step={0.001}
                onChange={handleSeekChange}
                onMouseDown={handleSeekMouseDown}
                onChangeCommitted={handleSeekMouseUp}
                sx={{ mx: 2 }}
              />
              <Typography variant="body2" sx={{ minWidth: 45 }}>
                {formatTime(duration)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <IconButton onClick={handlePrevious}>
                  <SkipPrevious />
                </IconButton>
                <IconButton onClick={handlePlayPause}>
                  {playing ? <Pause /> : <PlayArrow />}
                </IconButton>
                <IconButton onClick={handleNext}>
                  <SkipNext />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={handleMute}>
                  {muted ? <VolumeOff /> : <VolumeUp />}
                </IconButton>
                <Slider
                  value={volume}
                  min={0}
                  max={1}
                  step={0.1}
                  onChange={handleVolumeChange}
                  sx={{ width: 100, mx: 2 }}
                />
                
                <IconButton onClick={() => setShowSpeedMenu(!showSpeedMenu)}>
                  <Speed />
                </IconButton>
                {showSpeedMenu && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 60,
                      right: 20,
                      bgcolor: 'background.paper',
                      boxShadow: 3,
                      borderRadius: 2,
                      p: 1
                    }}
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <Button
                        key={speed}
                        size="small"
                        onClick={() => handleSpeedChange(speed)}
                        color={playbackRate === speed ? 'primary' : 'inherit'}
                      >
                        {speed}x
                      </Button>
                    ))}
                  </Box>
                )}

                <IconButton onClick={handleFullscreen}>
                  <Fullscreen />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Video Info */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              {content?.title}
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              {content?.description}
            </Typography>
            <Typography variant="body2">
              Duration: {formatTime(duration)} | Watch Time: {formatTime(watchTime)}
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default VideoView;