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
  Speed,
  ScreenRotation
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProgress } from '../../context/ProgressContext';
import axios from '../../utils/axios';
import { formatTime } from '../../utils/helpers';
import { resolveUploadSrc } from '../../utils/media';

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
  const [videoBlobUrl, setVideoBlobUrl] = useState('');
  const [videoError, setVideoError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  const playerRef = useRef(null);
  const watchTimeInterval = useRef(null);

  useEffect(() => {
    fetchContent();
  }, [contentId]);

  useEffect(() => {
    return () => {
      if (videoBlobUrl) {
        URL.revokeObjectURL(videoBlobUrl);
      }
    };
  }, [videoBlobUrl]);

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

  const fetchVideoBlob = async (url) => {
    if (!url) return;
    try {
      setVideoError(false);
      const response = await axios.get(url, { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(response.data);
      if (videoBlobUrl) {
        URL.revokeObjectURL(videoBlobUrl);
      }
      setVideoBlobUrl(blobUrl);
    } catch (error) {
      console.error('Error fetching video blob:', error);
      setVideoError(true);
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

  const handleSeekChange = (e, newValue) => setPlayed(newValue);
  const handleSeekMouseDown = () => setSeeking(true);

  const handleSeekMouseUp = (e, newValue) => {
    setSeeking(false);
    if (playerRef.current && Number.isFinite(playerRef.current.duration)) {
      playerRef.current.currentTime = playerRef.current.duration * newValue;
    }
  };

  const handleLoadedMetadata = () => {
    if (playerRef.current?.duration) {
      setDuration(playerRef.current.duration);
    }
  };

  const handleFullscreen = () => {
    const wrapper = playerRef.current;
    if (wrapper?.requestFullscreen) {
      wrapper.requestFullscreen().then(async () => {
        setIsFullscreen(true);
        if (screen?.orientation?.lock) {
          try {
            await screen.orientation.lock('landscape');
            setIsLandscape(true);
          } catch (err) {
            // ignore if not allowed
          }
        }
      });
    }
  };

  const handleToggleLandscape = async () => {
    if (!screen?.orientation?.lock) return;
    try {
      if (!isLandscape) {
        await screen.orientation.lock('landscape');
        setIsLandscape(true);
      } else if (screen.orientation.unlock) {
        screen.orientation.unlock();
        setIsLandscape(false);
      }
    } catch (err) {
      // ignore if not allowed
    }
  };

  const handleVideoEnd = async () => {
    setPlaying(false);
    await updateProgress(contentId, {
      completed: true,
      watchTime: Math.round(duration * played)
    });
  };

  const formatClock = (secondsValue) => {
    const total = Math.max(0, Math.floor(secondsValue || 0));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const rawVideoSrc = content?.videoUrl || content?.videoFile || content?.video?.url || content?.contentUrl || content?.url;
  const videoSrc = resolveUploadSrc(rawVideoSrc);

  useEffect(() => {
    if (videoSrc) {
      fetchVideoBlob(videoSrc);
    }
  }, [videoSrc]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.muted = muted;
      playerRef.current.volume = volume;
      playerRef.current.playbackRate = playbackRate;
      if (playing) {
        playerRef.current.play().catch(() => {});
      } else {
        playerRef.current.pause();
      }
    }
  }, [videoBlobUrl, playing, muted, volume, playbackRate]);

  useEffect(() => {
    const handleFsChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active) {
        setIsLandscape(false);
        if (screen?.orientation?.unlock) {
          try {
            screen.orientation.unlock();
          } catch (err) {
            // ignore
          }
        }
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 4, overflow: 'hidden' }}>
          {videoBlobUrl ? (
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: { xs: '100vh', sm: '70vh' },
                aspectRatio: { sm: '16 / 9' },
                bgcolor: 'black',
                borderRadius: { xs: 0, sm: 2 },
                overflow: 'hidden'
              }}
            >
              <video
                ref={playerRef}
                src={videoBlobUrl}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
                playsInline
                muted={muted}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={() => {
                  if (!playerRef.current || seeking) return;
                  const current = playerRef.current.currentTime || 0;
                  const dur = playerRef.current.duration || 0;
                  if (dur > 0) setPlayed(current / dur);
                }}
                onEnded={handleVideoEnd}
                onError={() => setVideoError(true)}
              />
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="textSecondary">
                {videoError ? 'Video failed to load.' : 'Loading video...'}
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <Slider
              value={played}
              min={0}
              max={1}
              step={0.001}
              onChange={handleSeekChange}
              onMouseDown={handleSeekMouseDown}
              onChangeCommitted={handleSeekMouseUp}
              sx={{
                mx: 0,
                color: 'primary.main',
                '& .MuiSlider-thumb': { width: 12, height: 12 },
                '& .MuiSlider-rail': { opacity: 0.3 }
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {content?.Topic?.name && (
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                  {content.Topic.name}
                </Typography>
              )}
              <IconButton><SkipPrevious /></IconButton>
              <IconButton
                onClick={() => {
                  setPlaying((v) => {
                    const next = !v;
                    if (playerRef.current) {
                      if (next) {
                        playerRef.current.play().catch(() => {});
                      } else {
                        playerRef.current.pause();
                      }
                    }
                    return next;
                  });
                }}
              >
                {playing ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton><SkipNext /></IconButton>

              <IconButton
                onClick={() => {
                  setMuted((v) => {
                    const next = !v;
                    if (playerRef.current) playerRef.current.muted = next;
                    return next;
                  });
                }}
              >
                {muted ? <VolumeOff /> : <VolumeUp />}
              </IconButton>
              <Slider
                value={volume}
                min={0}
                max={1}
                step={0.1}
                onChange={(e, val) => {
                  const next = Array.isArray(val) ? val[0] : val;
                  setVolume(next);
                  if (playerRef.current) playerRef.current.volume = next;
                }}
                sx={{ width: { xs: 80, sm: 120 } }}
              />

              <IconButton onClick={() => setShowSpeedMenu((v) => !v)}><Speed /></IconButton>
              {showSpeedMenu && (
                <Box sx={{ position: 'absolute', bottom: 60, right: 20, bgcolor: 'background.paper', boxShadow: 3, borderRadius: 2, p: 1 }}>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                    <Button
                      key={speed}
                      size="small"
                      onClick={() => {
                        setPlaybackRate(speed);
                        if (playerRef.current) playerRef.current.playbackRate = speed;
                        setShowSpeedMenu(false);
                      }}
                      color={playbackRate === speed ? 'primary' : 'inherit'}
                    >
                      {speed}x
                    </Button>
                  ))}
                </Box>
              )}

              <IconButton onClick={handleToggleLandscape} disabled={!isFullscreen}>
                <ScreenRotation />
              </IconButton>
              <IconButton onClick={handleFullscreen}><Fullscreen /></IconButton>

            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {content?.title}
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              {content?.description}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
              {`Duration ${formatClock(duration)} • Watch time ${watchTime} min`}
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default VideoView;
