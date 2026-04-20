import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  IconButton,
  MenuItem,
  Alert
} from '@mui/material';
import {
  PhotoCamera,
  ArrowBack,
  Save
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { resolveAvatarSrc } from '../../utils/media';
import { validateImageFile, validateName, validateSelectRequired } from '../../utils/validation';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    grade: user?.grade || '',
    avatar: null,
    parentPhone: user?.parentPhone || '',
    parentEmail: user?.parentEmail || ''
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileError = validateImageFile(file, 'Profile image');
      if (fileError) {
        setError(fileError);
        return;
      }
      setFormData({
        ...formData,
        avatar: file
      });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const nextErrors = {};
    const nameError = validateName(formData.name, 'Full name');
    if (nameError) nextErrors.name = nameError;
    if (user?.role === 'student') {
      const gradeError = validateSelectRequired(formData.grade, 'Grade');
      if (gradeError) nextErrors.grade = gradeError;
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('grade', formData.grade);
      // Only send parent fields when they are actually used. Sending empty strings
      // for non-student roles can trigger backend validation and block avatar updates.
      if (user?.role === 'student') {
        formDataToSend.append('parentPhone', formData.parentPhone);
        formDataToSend.append('parentEmail', formData.parentEmail);
      }
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }

      const result = await updateUser(formDataToSend);
      
      if (result.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back to Profile
        </Button>

        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Edit Profile
          </Typography>
          
          <Typography variant="body2" color="textSecondary" align="center" paragraph>
            Update your personal information
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={previewUrl || resolveAvatarSrc(user?.avatar)}
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    border: '3px solid',
                    borderColor: 'primary.main'
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </Avatar>
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    right: 0,
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: 'background.paper'
                    }
                  }}
                >
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleImageChange}
                  />
                  <PhotoCamera />
                </IconButton>
              </Box>
              <Typography variant="caption" color="textSecondary">
                Click the camera icon to change your profile picture
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!fieldErrors.name}
              helperText={fieldErrors.name}
              margin="normal"
              variant="outlined"
              required
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              disabled
              margin="normal"
              variant="outlined"
              helperText="Email cannot be changed"
            />

            <TextField
              select
              fullWidth
              label="Grade/Class"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              error={!!fieldErrors.grade}
              helperText={fieldErrors.grade}
              margin="normal"
              variant="outlined"
            >
              <MenuItem value="">Select Grade</MenuItem>
              <MenuItem value={1}>Class 1</MenuItem>
              <MenuItem value={2}>Class 2</MenuItem>
              <MenuItem value={3}>Class 3</MenuItem>
              <MenuItem value={4}>Class 4</MenuItem>
              <MenuItem value={5}>Class 5</MenuItem>
            </TextField>

            {user?.role === 'student' && (
              <TextField
                fullWidth
                label="Parent Mobile"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                placeholder="+1 555 123 4567"
                required
              />
            )}

            {user?.role === 'student' && (
              <TextField
                fullWidth
                label="Parent Email"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                placeholder="parent@example.com"
                required
              />
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="button"
                fullWidth
                variant="outlined"
                onClick={() => navigate('/profile')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                startIcon={<Save />}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </form>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default EditProfile;
