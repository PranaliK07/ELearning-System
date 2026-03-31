import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  AvatarGroup,
  TextField,
  InputAdornment,
  alpha,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Slide,
  Grow
} from '@mui/material';
import {
  AutoGraph,
  School,
  MenuBook,
  EmojiEvents,
  SupportAgent,
  PlayCircleOutline,
  CheckCircle,
  Stars,
  TrendingUp,
  Security,
  Speed,
  Psychology,
  Groups,
  ArrowForward,
  Dashboard,
  Timeline,
  LinkedIn,
  Twitter,
  YouTube,
  KeyboardArrowRight,
  Verified,
  Lightbulb,
  BarChart,
  Insights,
  Celebration,
  Grade,
  Campaign,
  WhatsApp,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Professional statistics
  const stats = [
    { label: 'Active Students', value: '50,000+', icon: <Groups />, color: '#3B82F6' },
    { label: 'Completion Rate', value: '89%', icon: <TrendingUp />, color: '#10B981' },
    { label: 'Partner Schools', value: '450+', icon: <School />, color: '#F59E0B' },
    { label: 'Student Satisfaction', value: '4.9/5', icon: <Stars />, color: '#EF4444' }
  ];

  // Features data - properly structured
  const featuresData = {
    forStudents: [
      { icon: <Psychology />, title: 'Personalized Learning', description: 'AI-powered paths adapt to individual pace and learning style', color: '#3B82F6' },
      { icon: <Speed />, title: 'Micro-Lessons', description: '5-10 minute sessions optimized for maximum retention', color: '#10B981' },
      { icon: <EmojiEvents />, title: 'Gamified Experience', description: 'Earn badges, level up, and track achievements', color: '#F59E0B' }
    ],
    forTeachers: [
      { icon: <Dashboard />, title: 'Analytics Dashboard', description: 'Real-time insights on student progress and engagement', color: '#8B5CF6' },
      { icon: <AutoGraph />, title: 'Automated Grading', description: 'Save hours with intelligent assessment tools', color: '#EC489A' },
      { icon: <MenuBook />, title: 'Content Library', description: 'Access 10,000+ curated educational resources', color: '#06B6D4' }
    ],
    forParents: [
      { icon: <Timeline />, title: 'Progress Tracking', description: 'Daily updates on your child\'s learning journey', color: '#EF4444' },
      { icon: <Security />, title: 'Safe Environment', description: 'COPPA compliant with parental controls', color: '#14B8A6' },
      { icon: <SupportAgent />, title: 'Parent Portal', description: '24/7 access to reports and teacher communication', color: '#F97316' }
    ]
  };




  // Navigation items
  
  // Footer links
  const footerLinks = {
    product: ['Features'],
    company: ['About Us', 'Careers', 'Blog', 'Press Kit']
  };

  return (
    <Box sx={{ bgcolor: '#ffffff', overflowX: 'hidden' }}>
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
          zIndex: (theme) => theme.zIndex.appBar + 1,
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
                textDecoration: 'none',
                '&:hover': {
                  transform: 'scale(1.05)',
                  transition: 'transform 0.3s'
                }
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
      <Toolbar /> {/* Spacer for fixed navbar */}

      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 6, md: 10 },
        pb: { xs: 6, md: 10 }
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  <Chip
                    label="✨ Powered by Advanced AI"
                    sx={{
                      bgcolor: alpha('#ffffff', 0.2),
                      color: 'white',
                      fontWeight: 600,
                      mb: 3,
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                      fontWeight: 800,
                      color: 'white',
                      lineHeight: 1.2,
                      mb: 2
                    }}
                  >
                    Transform Learning Into
                    <Box component="span" sx={{ display: 'block', color: '#FFD700' }}>
                      An Adventure
                    </Box>
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: '1rem',
                      color: alpha('#ffffff', 0.9),
                      mb: 4,
                      lineHeight: 1.6
                    }}
                  >
                    Personalized learning platform that adapts to each student's pace.
                    Join 50,000+ students already experiencing the future of education.
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      variant="contained"
                      size="large"
                      sx={{
                        bgcolor: '#FFD700',
                        color: '#667eea',
                        px: 4,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 700,
                        '&:hover': {
                          bgcolor: '#FFE55C',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s'
                      }}
                      endIcon={<ArrowForward />}
                    >
                      Start Free Trial
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: '#FFD700',
                          color: '#FFD700'
                        }
                      }}
                      startIcon={<PlayCircleOutline />}
                    >
                      Watch Demo
                    </Button>
                  </Stack>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6}>
              <Zoom in timeout={1000}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#111827' }}>
                    🚀 Join 50,000+ learners
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      'Personalized learning paths',
                      'Real-time progress tracking',
                      'Interactive content library',
                      'Parent & teacher insights'
                    ].map((item, idx) => (
                      <Slide direction="left" in timeout={500 + idx * 100} key={item}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Verified sx={{ color: '#10B981', fontSize: 20 }} />
                          <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>
                            {item}
                          </Typography>
                        </Stack>
                      </Slide>
                    ))}
                  </Stack>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AvatarGroup max={4}>
                      <Avatar sx={{ bgcolor: '#667eea' }}>JD</Avatar>
                      <Avatar sx={{ bgcolor: '#10B981' }}>MK</Avatar>
                      <Avatar sx={{ bgcolor: '#F59E0B' }}>AS</Avatar>
                      <Avatar sx={{ bgcolor: '#EF4444' }}>+2k</Avatar>
                    </AvatarGroup>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                      Trusted by educators worldwide
                    </Typography>
                  </Box>
                </Paper>
              </Zoom>
            </Grid>
          </Grid>

          {/* Stats Section */}
          <Grid container spacing={2} sx={{ mt: 6 }}>
            {stats.map((stat, idx) => (
              <Grid item xs={6} sm={3} key={stat.label}>
                <Grow in timeout={1000 + idx * 100}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.8) }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" id="features" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip
            label="✨ Amazing Features"
            sx={{
              bgcolor: alpha('#667eea', 0.1),
              color: '#667eea',
              mb: 2,
              fontWeight: 600
            }}
          />
          <Typography variant="h3" sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' }, fontWeight: 800, mb: 2, color: '#111827' }}>
            Everything You Need to
            <Box component="span" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              {' '}Succeed
            </Box>
          </Typography>
          <Typography variant="body1" sx={{ color: '#6B7280', maxWidth: 600, mx: 'auto' }}>
            Comprehensive tools designed for modern education
          </Typography>
        </Box>

        {/* For Students Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#111827' }}>
            For Students
          </Typography>
          <Grid
            container
            spacing={3}
            wrap="nowrap"
            sx={{ overflowX: 'auto', pb: 1 }}
          >
            {featuresData.forStudents.map((feature, idx) => (
              <Grid item xs={12} sm={6} md={4} lg={4} sx={{ minWidth: 280 }} key={feature.title}>
                <Grow in timeout={500 + idx * 100}>
                  <Card sx={{ height: '100%', borderRadius: 3, transition: 'all 0.3s', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)' } }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ width: 56, height: 56, borderRadius: 2, background: alpha(feature.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, color: feature.color }}>
                        {React.cloneElement(feature.icon, { sx: { fontSize: 28 } })}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{feature.title}</Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>{feature.description}</Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* For Teachers Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#111827' }}>
            For Teachers
          </Typography>
          <Grid
            container
            spacing={3}
            wrap="nowrap"
            sx={{ overflowX: 'auto', pb: 1 }}
          >
            {featuresData.forTeachers.map((feature, idx) => (
              <Grid item xs={12} sm={6} md={4} lg={4} sx={{ minWidth: 280 }} key={feature.title}>
                <Grow in timeout={500 + idx * 100}>
                  <Card sx={{ height: '100%', borderRadius: 3, transition: 'all 0.3s', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)' } }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ width: 56, height: 56, borderRadius: 2, background: alpha(feature.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, color: feature.color }}>
                        {React.cloneElement(feature.icon, { sx: { fontSize: 28 } })}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{feature.title}</Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>{feature.description}</Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* For Parents Section */}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#111827' }}>
            For Parents
          </Typography>
          <Grid container spacing={3}>
            {featuresData.forParents.map((feature, idx) => (
              <Grid item xs={12} sm={6} md={4} lg={4} key={feature.title}>
                <Grow in timeout={500 + idx * 100}>
                  <Card sx={{ height: '100%', borderRadius: 3, transition: 'all 0.3s', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)' } }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ width: 56, height: 56, borderRadius: 2, background: alpha(feature.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, color: feature.color }}>
                        {React.cloneElement(feature.icon, { sx: { fontSize: 28 } })}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{feature.title}</Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>{feature.description}</Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>




      {/* CTA Section */}
      <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 2, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              Ready to Transform Learning?
            </Typography>
            <Typography variant="body1" sx={{ color: alpha('#FFFFFF', 0.9), mb: 4 }}>
              Join thousands of students already experiencing the future of education
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button variant="contained" size="large" sx={{ bgcolor: '#FFD700', color: '#667eea', px: 4, py: 1.5, textTransform: 'none', fontWeight: 700, borderRadius: '50px' }}>
                Start Free Trial
              </Button>
              <Button variant="outlined" size="large" sx={{ borderColor: 'white', color: 'white', px: 4, py: 1.5, textTransform: 'none', fontWeight: 600, borderRadius: '50px' }}>
                Contact Sales
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#111827', color: 'white', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontSize: '1.5rem' }}>ELS</Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3, lineHeight: 1.6 }}>
                Empowering the next generation through personalized, engaging education powered by AI.
              </Typography>
              <Stack direction="row" spacing={2}>
                <IconButton sx={{ color: '#9CA3AF', '&:hover': { color: '#667eea' } }}><Twitter /></IconButton>
                <IconButton sx={{ color: '#9CA3AF', '&:hover': { color: '#667eea' } }}><LinkedIn /></IconButton>
                <IconButton sx={{ color: '#9CA3AF', '&:hover': { color: '#667eea' } }}><YouTube /></IconButton>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Product</Typography>
              <Stack spacing={1}>
                {footerLinks.product.map((item) => (
                  <Button key={item} href={`#${item.toLowerCase()}`} sx={{ color: '#9CA3AF', p: 0, justifyContent: 'flex-start', textTransform: 'none', '&:hover': { color: '#667eea' } }}>
                    {item}
                  </Button>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Company</Typography>
              <Stack spacing={1}>
                {footerLinks.company.map((item) => (
                  <Button key={item} sx={{ color: '#9CA3AF', p: 0, justifyContent: 'flex-start', textTransform: 'none', '&:hover': { color: '#667eea' } }}>
                    {item}
                  </Button>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Stay Updated</Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>Get the latest updates on features and learning tips.</Typography>
              <TextField fullWidth placeholder="Enter your email" variant="outlined" size="small" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ bgcolor: '#1F2937', borderRadius: 2, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#374151' }, '&:hover fieldset': { borderColor: '#667eea' } } }} InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton size="small" sx={{ color: '#667eea' }}><KeyboardArrowRight /></IconButton></InputAdornment>), sx: { color: 'white' } }} />
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, borderColor: '#1F2937' }} />
          <Typography variant="body2" sx={{ color: '#9CA3AF', textAlign: 'center' }}>
            © {new Date().getFullYear()} ELS Learning. All rights reserved. Made with ❤️ for education.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
