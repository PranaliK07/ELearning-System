import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Toolbar,
  Typography,
  alpha,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  ArrowForward,
  CheckCircle,
  Email,
  Groups,
  LocationOn,
  School,
  WhatsApp
} from '@mui/icons-material';

const AboutPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const values = [
    {
      title: 'Student First',
      description: 'We design for clarity, confidence, and measurable learning outcomes.'
    },
    {
      title: 'Teacher Empowered',
      description: 'We reduce admin work and give educators actionable insights.'
    },
    {
      title: 'Trust and Safety',
      description: 'We prioritize privacy, accessibility, and safe learning spaces.'
    }
  ];

  const stats = [
    { label: 'Active Students', value: '50,000+', icon: <Groups /> },
    { label: 'Partner Schools', value: '450+', icon: <School /> },
    { label: 'Satisfaction', value: '4.9/5', icon: <CheckCircle /> }
  ];

  return (
    <Box sx={{ bgcolor: '#ffffff', overflowX: 'hidden', fontFamily: '"Poppins", "Segoe UI", "Inter", system-ui, sans-serif' }}>
      {/* Top Bar */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: { xs: 32, md: 36 },
          bgcolor: '#0B1220',
          color: 'white',
          zIndex: (t) => t.zIndex.appBar + 1,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            spacing={{ xs: 1.5, md: 3 }}
            alignItems="center"
            justifyContent="flex-start"
            sx={{ fontSize: '0.75rem' }}
          >
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              component="a"
              href="https://www.google.com/maps/search/?api=1&query=Chennai%2C%20IN"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textDecoration: 'none', '&:hover': { opacity: 0.85 } }}
            >
              <LocationOn sx={{ fontSize: 16, color: '#9CA3AF' }} />
              <Typography variant="caption" sx={{ color: '#E5E7EB' }}>
                Chennai, IN
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              component="a"
              href="mailto:hello@elslearning.com"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = 'mailto:hello@elslearning.com';
              }}
              sx={{ textDecoration: 'none', cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
            >
              <Email sx={{ fontSize: 16, color: '#9CA3AF' }} />
              <Typography variant="caption" sx={{ color: '#E5E7EB' }}>
                hello@elslearning.com
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              component="a"
              href="https://wa.me/919000000000"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textDecoration: 'none', '&:hover': { opacity: 0.85 } }}
            >
              <WhatsApp sx={{ fontSize: 16, color: '#9CA3AF' }} />
              <Typography variant="caption" sx={{ color: '#E5E7EB' }}>
                +91 90000 00000
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Navigation Bar */}
      <AppBar
        position="fixed"
        elevation={scrolled ? 4 : 0}
        sx={{
          top: { xs: 32, md: 36 },
          bgcolor: scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: scrolled ? '1px solid' : 'none',
          borderColor: 'rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1 }}>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                fontWeight: 800,
                fontSize: isMobile ? '1.5rem' : '1.8rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                letterSpacing: '-0.5px',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
            >
              ELS
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                ml: 'auto',
                alignItems: 'center',
                justifyContent: 'flex-end',
                flexWrap: 'wrap'
              }}
            >
              <Button
                component={Link}
                to="/"
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  color: '#1F2937',
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 2,
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    width: 0,
                    height: 2,
                    bgcolor: '#667eea',
                    transition: 'all 0.3s',
                    transform: 'translateX(-50%)'
                  },
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: '#667eea',
                    '&:after': { width: '70%' }
                  }
                }}
              >
                Home
              </Button>
              <Button
                component={Link}
                to="/about"
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  color: '#1F2937',
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 2,
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    width: 0,
                    height: 2,
                    bgcolor: '#667eea',
                    transition: 'all 0.3s',
                    transform: 'translateX(-50%)'
                  },
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: '#667eea',
                    '&:after': { width: '70%' }
                  }
                }}
              >
                About
              </Button>
              <Button
                component={Link}
                to="/contact"
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  color: '#1F2937',
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 2,
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    width: 0,
                    height: 2,
                    bgcolor: '#667eea',
                    transition: 'all 0.3s',
                    transform: 'translateX(-50%)'
                  },
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: '#667eea',
                    '&:after': { width: '70%' }
                  }
                }}
              >
                Contact
              </Button>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  ml: 1,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  borderRadius: '50px',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 20px rgba(102,126,234,0.3)'
                  },
                  transition: 'all 0.3s'
                }}
              >
                Login
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Box sx={{ height: { xs: 32, md: 36 } }} />
      <Toolbar />

      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: { xs: 8, md: 12 }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  color: 'white',
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                About ELS Learning
              </Typography>
              <Typography variant="body1" sx={{ color: alpha('#FFFFFF', 0.9), maxWidth: 620 }}>
                We build a learner-first platform that helps students grow confidence, helps teachers
                save time, and helps schools measure progress with clarity.
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  mt: 4,
                  bgcolor: '#FFFFFF',
                  color: '#667eea',
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '50px',
                  '&:hover': { bgcolor: '#F3F4F6' }
                }}
                endIcon={<ArrowForward />}
              >
                Learn More
              </Button>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 3.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                  Our Mission
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                  Make high-quality learning accessible and engaging for every student.
                </Typography>
                <Stack spacing={1.5}>
                  {['Personalized learning paths', 'Actionable insights', 'Safe learning environment'].map((item) => (
                    <Stack direction="row" spacing={1.5} alignItems="center" key={item}>
                      <CheckCircle sx={{ color: '#667eea', fontSize: 18 }} />
                      <Typography variant="body2" sx={{ color: '#374151' }}>
                        {item}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Story */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: '#111827' }}>
              Our Story
            </Typography>
            <Typography variant="body1" sx={{ color: '#6B7280', mb: 2 }}>
              ELS started with a simple idea: give every student a clear, personalized learning
              journey. Today, we partner with schools and families to deliver a platform that feels
              modern, intuitive, and results-driven.
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              We focus on the essentials: lessons that stick, tools teachers love, and insights that
              help parents stay informed.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: '#E5E7EB' }}>
              <CardContent sx={{ p: 3.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#111827' }}>
                  What makes us different
                </Typography>
                <Stack spacing={1.5}>
                  {['Teacher-friendly workflows', 'Actionable analytics', 'Student motivation tools'].map((item) => (
                    <Stack direction="row" spacing={1.5} alignItems="center" key={item}>
                      <CheckCircle sx={{ color: '#667eea', fontSize: 18 }} />
                      <Typography variant="body2" sx={{ color: '#374151' }}>
                        {item}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Values */}
      <Box sx={{ bgcolor: '#F9FAFB', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5, color: '#111827' }}>
              Our Values
            </Typography>
            <Typography variant="body1" sx={{ color: '#6B7280', maxWidth: 600, mx: 'auto' }}>
              The principles that guide everything we build.
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {values.map((value) => (
              <Grid item xs={12} md={4} key={value.title}>
                <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: '#E5E7EB' }}>
                  <CardContent sx={{ p: 3.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#111827' }}>
                      {value.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      {value.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Impact */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5, color: '#111827' }}>
            Our Impact
          </Typography>
          <Typography variant="body1" sx={{ color: '#6B7280', maxWidth: 600, mx: 'auto' }}>
            Proof that thoughtful learning design delivers results.
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {stats.map((stat) => (
            <Grid item xs={12} sm={4} key={stat.label}>
              <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: '#E5E7EB' }}>
                <CardContent sx={{ p: 3.5, textAlign: 'center' }}>
                  <Box sx={{ mb: 1, color: '#667eea' }}>
                    {React.cloneElement(stat.icon, { sx: { fontSize: 28 } })}
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#111827', color: 'white', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontSize: '1.5rem' }}>
                ELS
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3, lineHeight: 1.6 }}>
                Empowering the next generation through personalized, engaging education powered by AI.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>
                Contact
              </Typography>
              <Stack spacing={1.5}>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                  Chennai, IN
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                  hello@elslearning.com
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                  +91 90000 00000
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, borderColor: '#1F2937' }} />
          <Typography variant="body2" sx={{ color: '#9CA3AF', textAlign: 'center' }}>
            © {new Date().getFullYear()} ELS Learning. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutPage;
