import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import { Email, Visibility, VisibilityOff, Lock } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, validatePassword } from '../../utils/validation';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState('idle');

  const fieldRow = (icon, field) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, width: '100%', flex: 1 }}>
      <Box
        sx={{
          width: 44,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          color: 'primary.main',
          flexShrink: 0
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>{field}</Box>
    </Box>
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'password') {
      setPasswordStatus('idle');
    }
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setPasswordStatus('idle');
    const result = await login(formData.email, formData.password);
    setLoading(false);
    
    if (result.success) {
      setErrors({});
      setPasswordStatus('success');
      await new Promise((resolve) => setTimeout(resolve, 400));
      navigate('/dashboard');
    } else {
      setPasswordStatus('error');
      setErrors((prev) => ({
        ...prev,
        password: result.error || 'Incorrect password'
      }));
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          marginTop: { xs: 4, sm: 8 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: { xs: 3, sm: 4 },
            width: '100%',
            borderRadius: 4
          }}
        >
            <Typography
              component="h1"
              variant="h4"
              align="center"
              gutterBottom
              sx={{
                fontFamily: '"Comic Neue", cursive',
                fontWeight: 'bold',
                color: 'primary.main'
              }}
            >
              Welcome Back! 🎓
            </Typography>
            
            <Typography
              variant="body2"
              align="center"
              color="textSecondary"
              sx={{ mb: 3 }}
            >
              Login to continue your learning journey
            </Typography>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {fieldRow(
                  <Email fontSize="small" />,
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    margin="normal"
                    variant="outlined"
                  />
                )}

                {fieldRow(
                  <Lock fontSize="small" />,
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password || passwordStatus === 'error'}
                    helperText={
                      passwordStatus === 'success'
                        ? 'Password is correct'
                        : errors.password
                    }
                    FormHelperTextProps={{
                      sx: {
                        color: passwordStatus === 'success' ? '#2e7d32' : undefined
                      }
                    }}
                    margin="normal"
                    variant="outlined"
                    sx={{
                      ...(passwordStatus === 'success' && {
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#2e7d32' },
                          '&:hover fieldset': { borderColor: '#2e7d32' },
                          '&.Mui-focused fieldset': { borderColor: '#2e7d32' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#2e7d32' }
                      }),
                      ...(passwordStatus === 'error' && {
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#d32f2f' },
                          '&:hover fieldset': { borderColor: '#d32f2f' },
                          '&.Mui-focused fieldset': { borderColor: '#d32f2f' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#d32f2f' }
                      })
                    }}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff sx={{ fontSize: 34 }} /> : <Visibility sx={{ fontSize: 34 }} />}
                        </IconButton>
                      )
                    }}
                  />
                )}
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    style={{
                      color: '#0F766E',
                      textDecoration: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    Sign up here
                  </Link>
                </Typography>
              </Box>
            </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
