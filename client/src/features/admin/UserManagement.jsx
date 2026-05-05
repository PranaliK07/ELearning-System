import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  LinearProgress,
  Avatar,
  TextField,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  Divider,
  Stack,
  alpha,
  Tooltip
} from '@mui/material';
import { Add, Search, Edit, Delete, People } from '@mui/icons-material';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { resolveAvatarSrc } from '../../utils/media';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  validateEmail,
  validateName,
  validatePositiveInteger,
  validateSelectRequired
} from '../../utils/validation';

const UserManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student',
    grade: '',
    studentEmail: '',
    parentPhone: '',
    status: 'active'
  });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, userId: null });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get('/api/users');
      const usersData = Array.isArray(usersRes.data)
        ? usersRes.data
        : (usersRes.data?.users ? usersRes.data.users : []);
      setUsers(usersData);
    } catch (err) {
      toast.error('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return (Array.isArray(users) ? users : []).filter((user) => {
      const search = searchTerm.toLowerCase();
      const gradeStr = String(user.grade || '').toLowerCase();
      const classNameStr = `class ${gradeStr}`;
      
      return (
        String(user.name || '').toLowerCase().includes(search) ||
        String(user.email || '').toLowerCase().includes(search) ||
        String(user.role || '').toLowerCase().includes(search) ||
        gradeStr.includes(search) ||
        classNameStr.includes(search) ||
        String(user.parentPhone || '').toLowerCase().includes(search) ||
        String(user.status || '').toLowerCase().includes(search)
      );
    });
  }, [users, searchTerm]);

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/api/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId && u._id !== userId));
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const validateUserForm = () => {
    const nextErrors = {};
    const nameError = validateName(newUser.name, 'Full name');
    const emailError = validateEmail(newUser.email);
    const roleError = validateSelectRequired(newUser.role, 'Role');
    const statusError = validateSelectRequired(newUser.status, 'Status');

    if (nameError) nextErrors.name = nameError;
    if (emailError) nextErrors.email = emailError;
    if (roleError) nextErrors.role = roleError;
    if (statusError) nextErrors.status = statusError;

    if (newUser.role === 'student') {
      const gradeError = validatePositiveInteger(newUser.grade, 'Grade');
      if (gradeError) nextErrors.grade = gradeError;
    }

    if (newUser.role === 'parent') {
      const phone = String(newUser.parentPhone || '').trim();
      if (!phone) {
        nextErrors.parentPhone = 'Parent mobile number is required';
      } else if (!/^[+\d][\d\s()-]{6,19}$/.test(phone)) {
        nextErrors.parentPhone = 'Enter a valid parent mobile number';
      }
    }

    if (newUser.role === 'parent' && newUser.studentEmail.trim()) {
      const studentEmailError = validateEmail(newUser.studentEmail, 'Student email');
      if (studentEmailError) nextErrors.studentEmail = studentEmailError;
    }

    return nextErrors;
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ 
        p: { xs: 2.5, sm: 4 }, 
        borderRadius: 5,
        border: '2.5px solid rgba(0, 109, 91, 0.55)', // Vivid Mint themed border
        borderTop: '6px solid #006D5B', 
        bgcolor: '#ffffff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        transition: 'all 0.3s ease'
      }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            mb: 3
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <People color="primary" /> User Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ px: 3, py: 1, borderRadius: 2 }}
              onClick={() => {
                setEditingUserId(null);
                setOriginalUser(null);
                setNewUser({ name: '', email: '', role: 'student', grade: '', studentEmail: '', parentPhone: '', status: 'active' });
                setOpenUserDialog(true);
              }}
            >
              Add User
            </Button>
          </Box>
        </Box>

        {loading ? (
          <LinearProgress />
        ) : isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredUsers.length === 0 ? (
              <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                No users found
              </Typography>
            ) : (
              filteredUsers.map((user) => (
                <Paper
                  key={user.id || user._id}
                  variant="outlined"
                  sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    position: 'relative',
                    border: '1.5px solid rgba(0, 109, 91, 0.15)',
                    borderTop: '6px solid #006D5B',
                    bgcolor: '#ffffff',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">{user.name || 'Unknown'}</Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        {user.email || 'No email'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                      <Chip
                        label={user.role || 'student'}
                        size="small"
                        color={
                          user.role === 'admin' || user.role === 'demo'
                            ? 'error'
                            : user.role === 'teacher'
                              ? 'warning'
                              : user.role === 'parent'
                                ? 'secondary'
                                : 'primary'
                        }
                      />
                      <Chip
                        label={user.status || 'active'}
                        size="small"
                        color={(user.status === 'active' || user.status === 'Active') ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Grade</Typography>
                      <Typography variant="body2">{user.grade || '-'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Last Login</Typography>
                      <Typography variant="body2">{user.lastLogin || 'Never'}</Typography>
                    </Grid>
                    {user.role === 'student' && user.parent && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="textSecondary">Parent</Typography>
                        <Typography variant="body2">
                          {user.parent.name} ({user.parent.email})
                        </Typography>
                      </Grid>
                    )}
                  </Grid>

                  <Divider sx={{ my: 1.5 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => {
                        setEditingUserId(user.id || user._id);
                        setNewUser({
                          name: user.name || '',
                          email: user.email || '',
                          role: user.role || 'student',
                          grade: user.grade || '',
                          studentEmail: '',
                          parentPhone: user.parentPhone || '',
                          status: (user.status === 'inactive' || user.isActive === false) ? 'inactive' : 'active'
                        });
                        setOpenUserDialog(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => setConfirmDialog({ open: true, userId: user.id || user._id })}
                    >
                      Delete
                    </Button>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>User Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Class</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Parent Mobile</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="textSecondary">
                        No users found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow 
                      key={user.id || user._id} 
                      hover 
                      sx={{ 
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                        '&:hover': { 
                          bgcolor: 'rgba(0, 0, 0, 0.04) !important',
                          boxShadow: 'inset 4px 0 0 #006D5B',
                          '& .MuiTableCell-root': {
                            color: 'primary.main'
                          }
                        } 
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.875rem' }}
                            src={resolveAvatarSrc(user.avatar)}
                          >
                            {user.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">{user.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role || 'student'}
                          size="small"
                          color={
                            user.role === 'admin' || user.role === 'demo'
                              ? 'error'
                              : user.role === 'teacher'
                                ? 'warning'
                                : user.role === 'parent'
                                  ? 'secondary'
                                  : 'primary'
                          }
                        />
                      </TableCell>
                      <TableCell>{user.grade || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.status || 'active'}
                          size="small"
                          color={(user.status === 'active' || user.status === 'Active') ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{user.parentPhone || '-'}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const userData = {
                                name: user.name || '',
                                email: user.email || '',
                                role: user.role || 'student',
                                grade: user.grade || '',
                                studentEmail: '',
                                parentPhone: user.parentPhone || '',
                                status: (user.status === 'inactive' || user.isActive === false) ? 'inactive' : 'active'
                              };
                              setEditingUserId(user.id || user._id);
                              setOriginalUser(userData);
                              setNewUser(userData);
                              setOpenUserDialog(true);
                            }}
                            sx={{ 
                              bgcolor: alpha(theme.palette.info.main, 0.1), 
                              color: 'info.main',
                              borderRadius: 1.5,
                              '&:hover': { bgcolor: 'info.main', color: 'white' }
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setConfirmDialog({ open: true, userId: user.id || user._id })}
                            sx={{ 
                              bgcolor: alpha(theme.palette.error.main, 0.1), 
                              borderRadius: 1.5,
                              '&:hover': { bgcolor: 'error.main', color: 'white' }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={openUserDialog}
        onClose={() => {
          setOpenUserDialog(false);
          setEditingUserId(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>{editingUserId ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Full Name"
              variant="outlined"
              value={newUser.name}
              onChange={(e) => {
                // Only allow characters and spaces
                const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                setNewUser((prev) => ({ ...prev, name: val }));
                setFormErrors((prev) => ({ ...prev, name: '' }));
              }}
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
            <TextField
              fullWidth
              type="email"
              label="Email Address"
              variant="outlined"
              value={newUser.email}
              onChange={(e) => {
                const val = e.target.value;
                setNewUser((prev) => ({ ...prev, email: val }));
                if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                  setFormErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }));
                } else {
                  setFormErrors((prev) => ({ ...prev, email: '' }));
                }
              }}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            <FormControl fullWidth variant="outlined">
              <InputLabel>User Role</InputLabel>
              <Select
                label="User Role"
                value={newUser.role}
                onChange={(e) => {
                  setNewUser((prev) => ({ ...prev, role: e.target.value, studentEmail: '' }));
                  setFormErrors((prev) => ({ ...prev, role: '', grade: '', studentEmail: '' }));
                }}
                error={!!formErrors.role}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="teacher">Teacher</MenuItem>
                <MenuItem value="demo">Demo User</MenuItem>
                <MenuItem value="parent">Parent</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Account Status</InputLabel>
              <Select
                label="Account Status"
                value={newUser.status}
                onChange={(e) => {
                  setNewUser((prev) => ({ ...prev, status: e.target.value }));
                  setFormErrors((prev) => ({ ...prev, status: '' }));
                }}
                error={!!formErrors.status}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Class"
              placeholder="Enter class number"
              disabled={newUser.role !== 'student'}
              value={newUser.grade}
              onChange={(e) => {
                setNewUser((prev) => ({ ...prev, grade: e.target.value.replace(/[^\d]/g, '') }));
                setFormErrors((prev) => ({ ...prev, grade: '' }));
              }}
              error={!!formErrors.grade}
              helperText={formErrors.grade || (newUser.role !== 'student' ? "Only applicable for students" : "")}
            />
            <TextField
              fullWidth
              label="Primary Contact Number"
              placeholder="+91 00000 00000"
              value={newUser.parentPhone}
              onChange={(e) => {
                // Allow digits and '+' at the start
                const val = e.target.value.replace(/[^\d+]/g, '');
                setNewUser((prev) => ({ ...prev, parentPhone: val }));
                setFormErrors((prev) => ({ ...prev, parentPhone: '' }));
              }}
              error={!!formErrors.parentPhone}
              helperText={formErrors.parentPhone}
            />
            {newUser.role === 'parent' && (
              <TextField
                fullWidth
                label="Student Email to Link"
                variant="filled"
                value={newUser.studentEmail}
                onChange={(e) => {
                  setNewUser((prev) => ({ ...prev, studentEmail: e.target.value }));
                  setFormErrors((prev) => ({ ...prev, studentEmail: '' }));
                }}
                placeholder="Enter student's email to link this parent"
                error={!!formErrors.studentEmail}
                helperText={formErrors.studentEmail}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setOpenUserDialog(false);
              setEditingUserId(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              const nextErrors = validateUserForm();
              setFormErrors(nextErrors);
              if (Object.keys(nextErrors).length > 0) {
                toast.error('Please fix the highlighted fields');
                return;
              }

              try {
                const payload = {
                  name: newUser.name.trim(),
                  email: newUser.email.trim(),
                  role: newUser.role,
                  grade: newUser.role === 'student' && newUser.grade ? Number(newUser.grade) : null,
                  isActive: newUser.status === 'active',
                  studentEmail: newUser.role === 'parent' && newUser.studentEmail ? newUser.studentEmail.trim() : undefined,
                  parentPhone: (newUser.role === 'parent' || newUser.role === 'student') ? String(newUser.parentPhone || '').trim() : undefined
                };

                let response;

                if (editingUserId) {
                  // Check if any changes were actually made
                  const isUnchanged = 
                    originalUser.name === newUser.name.trim() &&
                    originalUser.email === newUser.email.trim() &&
                    originalUser.role === newUser.role &&
                    String(originalUser.grade) === String(newUser.grade) &&
                    originalUser.status === newUser.status &&
                    originalUser.parentPhone === String(newUser.parentPhone || '').trim();

                  if (isUnchanged) {
                    setOpenUserDialog(false);
                    setEditingUserId(null);
                    return;
                  }

                  response = await api.put(`/api/users/${editingUserId}`, payload);
                  await fetchUsers();
                } else {
                  try {
                    response = await api.post('/api/users', payload);
                  } catch (postErr) {
                    if (postErr?.response?.status === 404) {
                      response = await api.post('/api/admin/users', payload);
                    } else {
                      throw postErr;
                    }
                  }

                  const createdUser = response?.data?.user;

                  if (createdUser) {
                    setUsers((prev) => [{ ...createdUser, status: createdUser.isActive ? 'active' : 'inactive' }, ...prev]);
                  } else {
                    await fetchUsers();
                  }
                }

                setNewUser({ name: '', email: '', role: 'student', grade: '', studentEmail: '', parentPhone: '', status: 'active' });
                setOpenUserDialog(false);
                setEditingUserId(null);

                const tempPassword = response?.data?.temporaryPassword;
                if (!editingUserId && tempPassword) {
                  toast.success(`User added. Temporary password: ${tempPassword}`);
                } else {
                  toast.success(response?.data?.message || (editingUserId ? 'User updated successfully' : 'User added successfully'));
                }
              } catch (err) {
                toast.error(err?.response?.data?.message || (editingUserId ? 'Failed to update user' : 'Failed to add user'));
              }
            }}
          >
            {editingUserId ? 'Update User' : 'Save User'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDialog.open}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={() => {
          handleDeleteUser(confirmDialog.userId);
          setConfirmDialog({ open: false, userId: null });
        }}
        onClose={() => setConfirmDialog({ open: false, userId: null })}
      />
    </Container>
  );
};

export default UserManagement;
