import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  IconButton,
  MenuItem,
  Alert
} from '@mui/material';
import {
  PhotoCamera,
  Save,
  Cancel
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ProfileForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  error = null
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    grade: initialData?.grade || '',
    bio: initialData?.bio || '',
    avatar: null
  });
  const [previewUrl, setPreviewUrl] = useState(initialData?.avatarUrl || null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Strict validation for name field (characters and spaces only)
    if (name === 'name') {
      value = value.replace(/[^a-zA-Z\s]/g, '');
    }

    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        avatar: file
      });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(formData);
  };

  return (
    <Paper
      sx={{
        p: 4,
        borderRadius: 4,
        border: '2px solid',
        borderColor: 'primary.main',
        borderTop: '10px solid',
        borderTopColor: 'primary.main',
        boxShadow: '0 14px 34px rgba(0, 109, 91, 0.12)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 18px 40px rgba(0, 109, 91, 0.18)'
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom align="center">
          Edit Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={previewUrl}
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  border: '3px solid',
                  borderColor: 'primary.main'
                }}
              >
                {formData.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <IconButton
                color="primary"
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
          </Box>

          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
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
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            margin="normal"
            variant="outlined"
            disabled
          />

          <TextField
            select
            fullWidth
            label="Class"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
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

          <TextField
            fullWidth
            label="Bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            multiline
            rows={3}
            placeholder="Tell us a little about yourself..."
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="button"
              fullWidth
              variant="outlined"
              onClick={onCancel}
              startIcon={<Cancel />}
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
      </motion.div>
    </Paper>
  );
};

export default ProfileForm;
