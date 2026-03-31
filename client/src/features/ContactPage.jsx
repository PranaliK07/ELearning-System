import React from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  InputAdornment,
  Stack,
  Toolbar,
  Typography,
  TextField,
  Paper
} from '@mui/material';
import { ArrowOutward, MailOutline, SupportAgent } from '@mui/icons-material';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [contact, setContact] = React.useState({
    name: '',
    email: '',
    message: ''
  });


  const handleContactChange = (event) => {
    const { name, value } = event.target;
    setContact((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = (event) => {
    event.preventDefault();
    if (!contact.name.trim() || !contact.email.trim() || !contact.message.trim()) {
      toast.error('Please fill out all fields before sending.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(contact.email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }

    toast.success('Message sent. We will reply within 24 hours!');
    setContact({ name: '', email: '', message: '' });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f7f5ff',
        color: '#1f1b33',
        fontFamily: '"Sora", "Space Grotesk", sans-serif'
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(247,245,255,0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(31,27,51,0.08)'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Space Grotesk", "Sora", sans-serif',
              fontWeight: 800,
              color: '#1f1b33',
              letterSpacing: '-0.5px'
            }}
          >
            ELS Learning
          </Typography>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Button component={Link} to="/" sx={{ color: '#1f1b33', textTransform: 'none', fontWeight: 600 }}>
              Home
            </Button>
            <Button component={Link} to="/about" sx={{ color: '#1f1b33', textTransform: 'none', fontWeight: 600 }}>
              About
            </Button>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              sx={{ bgcolor: '#1f1b33', '&:hover': { bgcolor: '#151226' } }}
              endIcon={<ArrowOutward />}
            >
              Login
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          background: 'linear-gradient(135deg, #5b42ff 0%, #3a2aa8 45%, #1f1b33 100%)',
          color: 'white'
        }}
      >
        <Container sx={{ py: { xs: 7, md: 10 } }}>
          <Stack spacing={2} sx={{ maxWidth: 760 }}>
            <Typography
              variant="h2"
              sx={{
                fontFamily: '"Fraunces", "Sora", serif',
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: '-1px'
              }}
            >
              Contact Us
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Tell us about your school, classroom, or learning goals. We reply within one business day.
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container sx={{ py: { xs: 6, md: 8 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={5}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f1b33', mb: 2 }}>
              We are here to help
            </Typography>
            <Typography variant="body1" sx={{ color: '#4b476b', mb: 3 }}>
              Share your questions and we will match you with the right support. Schools can request onboarding and
              training for educators.
            </Typography>
            <Stack spacing={2}>
              {[
                'Dedicated onboarding support for schools',
                'Weekly insights delivered to parents and guardians',
                'Secure profiles for every learner'
              ].map((item) => (
                <Paper
                  key={item}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: '1px solid rgba(31,27,51,0.08)',
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'center'
                  }}
                >
                  <SupportAgent sx={{ color: '#667eea' }} />
                  <Typography variant="body2" sx={{ color: '#4b476b' }}>
                    {item}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Box>
          <Box sx={{ flex: 1, maxWidth: 520 }}>
            <Stack component="form" spacing={2} onSubmit={handleContactSubmit}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={contact.name}
                onChange={handleContactChange}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={contact.email}
                onChange={handleContactChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutline />
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                fullWidth
                label="Message"
                name="message"
                value={contact.message}
                onChange={handleContactChange}
                multiline
                minRows={4}
              />
              <Button type="submit" variant="contained" sx={{ bgcolor: '#1f1b33', '&:hover': { bgcolor: '#151226' } }}>
                Send Message
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Container>


      <Box sx={{ bgcolor: '#141125', color: 'white', py: { xs: 5, md: 7 } }}>
        <Container>
          <Stack spacing={4}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="space-between">
              <Box sx={{ maxWidth: 360 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  ELS Learning
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                  A calm learning hub for students, teachers, and families. Built to keep progress visible every day.
                </Typography>
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
                <Stack spacing={1}>
                  <Typography variant="overline" sx={{ letterSpacing: '0.12em' }}>
                    Explore
                  </Typography>
                  <Button component={Link} to="/" sx={{ color: 'white', textTransform: 'none', p: 0 }}>
                    Home
                  </Button>
                  <Button component={Link} to="/about" sx={{ color: 'white', textTransform: 'none', p: 0 }}>
                    About
                  </Button>
                  <Button component={Link} to="/login" sx={{ color: 'white', textTransform: 'none', p: 0 }}>
                    Login
                  </Button>
                </Stack>
                <Stack spacing={1}>
                  <Typography variant="overline" sx={{ letterSpacing: '0.12em' }}>
                    For Schools
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    onboarding@els-learning.com
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    +1 (555) 210-4488
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                (c) {new Date().getFullYear()} ELS Learning System
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Built for students, teachers, and parents.
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default ContactPage;
