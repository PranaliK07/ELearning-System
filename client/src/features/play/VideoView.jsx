import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  IconButton,
  Slider,
  CircularProgress,
  Button,
  Chip
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
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';
import { useProgress } from '../../context/ProgressContext';
import axios from '../../utils/axios';
import { formatTime, resolveMediaUrl } from '../../utils/helpers';

const VideoView = () => {
  const { contentId } = useParams();
  const { updateProgress } = useProgress();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(true);
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

    return () => stopWatchTimeTracking();
  }, [playing]);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`/api/content/${contentId}`);
      setContent(response.data);
    } catch (error) {
      console.error('Error fetching content:', error);
      setContent(null);
    } finally {
      setLoading(false);
    }
  };

  const startWatchTimeTracking = () => {
    watchTimeInterval.current = setInterval(() => {
      setWatchTime((prev) => prev + 1);
    }, 60000);
  };

  const stopWatchTimeTracking = () => {
    if (watchTimeInterval.current) {
      clearInterval(watchTimeInterval.current);
      watchTimeInterval.current = null;
    }
  };

  const handleProgress = (state) => {
    if (!seeking) setPlayed(state.played);
  };

  const handleSeekChange = (e, newValue) => setPlayed(newValue);
  const handleSeekMouseDown = () => setSeeking(true);

  const handleSeekMouseUp = (e, newValue) => {
    setSeeking(false);
    playerRef.current?.seekTo(newValue);
  };

  const handleReady = () => {
    const dur = playerRef.current?.getDuration?.();
    if (dur && !Number.isNaN(dur)) setDuration(dur);
  };

  const handleFullscreen = () => {
    const wrapper = playerRef.current?.wrapper;
    if (wrapper?.requestFullscreen) wrapper.requestFullscreen();
  };

  const handleVideoEnd = async () => {
    setPlaying(false);
    await updateProgress(contentId, {
      completed: true,
      watchTime: Math.round(duration * played)
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const videoSrc = resolveMediaUrl(content?.videoUrl || content?.videoFile) || 'https://www.youtube.com/watch?v=LXb3EKWsInQ';

  return (
    <Container maxWidth="lg">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
            <ReactPlayer
              ref={playerRef}
              url={videoSrc}
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
              playing={playing}
              volume={volume}
              muted={muted}
              playbackRate={playbackRate}
              onProgress={handleProgress}
              onReady={handleReady}
              onEnded={handleVideoEnd}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ minWidth: 45 }}>{formatTime(Math.floor(duration * played))}</Typography>
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
              <Typography variant="body2" sx={{ minWidth: 45 }}>{formatTime(Math.floor(duration))}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <IconButton><SkipPrevious /></IconButton>
                <IconButton onClick={() => setPlaying((v) => !v)}>{playing ? <Pause /> : <PlayArrow />}</IconButton>
                <IconButton><SkipNext /></IconButton>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={() => setMuted((v) => !v)}>{muted ? <VolumeOff /> : <VolumeUp />}</IconButton>
                <Slider value={volume} min={0} max={1} step={0.1} onChange={(e, val) => setVolume(val)} sx={{ width: { xs: 70, sm: 100 }, mx: 2 }} />

                <IconButton onClick={() => setShowSpeedMenu((v) => !v)}><Speed /></IconButton>
                {showSpeedMenu && (
                  <Box sx={{ position: 'absolute', bottom: 60, right: 20, bgcolor: 'background.paper', boxShadow: 3, borderRadius: 2, p: 1 }}>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <Button key={speed} size="small" onClick={() => { setPlaybackRate(speed); setShowSpeedMenu(false); }} color={playbackRate === speed ? 'primary' : 'inherit'}>
                        {speed}x
                      </Button>
                    ))}
                  </Box>
                )}

                <IconButton onClick={handleFullscreen}><Fullscreen /></IconButton>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>{content?.title}</Typography>
            <Typography variant="body1" color="textSecondary" paragraph>{content?.description}</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={`Duration: ${formatTime(Math.floor(duration))}`} />
              <Chip label={`Watch Time: ${watchTime} min`} />
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default VideoView;
