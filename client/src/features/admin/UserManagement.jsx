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
  Divider
} from '@mui/material';
import { Add, Search, Edit, Delete } from '@mui/icons-material';
import { Email, Badge, Lock, Phone, School, Person } from '@mui/icons-material';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePositiveInteger,
  validateSelectRequired
} from '../../utils/validation';

const UserManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserSnapshot, setEditingUserSnapshot] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    grade: '',
    studentEmail: '',
    parentPhone: '',
    status: 'active'
  });

  const fieldRow = (icon, field, compact = false) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, width: '100%', flex: 1 }}>
      <Box
        sx={{
          width: compact ? 40 : 44,
          height: compact ? 40 : 56,
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
      <Box sx={{ flex: 1, minWidth: 0 }}>{field}</Box>
    </Box>
  );

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get('/api/users');
      const usersData = Array.isArray(usersRes.data)
        ? usersRes.data
        : (usersRes.data?.users ? usersRes.data.users : []);
      setUsers(usersData);
    } catch {
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
    const term = searchTerm.toLowerCase();
    return (Array.isArray(users) ? users : []).filter((user) => {
      const matchesSearch = (user.name || '').toLowerCase().includes(term) ||
        (user.email || '').toLowerCase().includes(term) ||
        (user.role || '').toLowerCase().includes(term) ||
        (String(user.grade || '')).toLowerCase().includes(term) ||
        (user.status || '').toLowerCase().includes(term) ||
        (user.lastLogin || '').toLowerCase().includes(term) ||
        (user.parent?.name || '').toLowerCase().includes(term) ||
        (user.parent?.email || '').toLowerCase().includes(term) ||
        (user.email || '').toLowerCase().includes(term);
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/api/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId && u._id !== userId));
      toast.success('User deleted successfully');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const openDeleteDialog = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    await handleDeleteUser(userToDelete.id || userToDelete._id);
    closeDeleteDialog();
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

    if (newUser.role === 'student' || newUser.role === 'teacher') {
      if (newUser.role === 'student' || (newUser.role === 'teacher' && newUser.grade)) {
        const gradeError = validatePositiveInteger(newUser.grade, 'Class');
        if (gradeError) nextErrors.grade = gradeError;
      }
    } else if (false) {
      const gradeError = validatePositiveInteger(newUser.grade, 'Class');
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

    if (newUser.password && String(newUser.password).trim().length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    return nextErrors;
  };

  const buildUserPayload = () => ({
    name: newUser.name.trim(),
    email: newUser.email.trim(),
    password: newUser.password ? String(newUser.password).trim() : undefined,
    role: newUser.role,
    grade: (newUser.role === 'student' || newUser.role === 'teacher') && newUser.grade ? Number(newUser.grade) : null,
    isActive: newUser.status === 'active',
    studentEmail: newUser.role === 'parent' && newUser.studentEmail ? newUser.studentEmail.trim() : undefined,
    parentPhone: (newUser.role === 'parent' || newUser.role === 'student') ? String(newUser.parentPhone || '').trim() : undefined
  });

  const isEditUnchanged = (payload) => {
    if (!editingUserSnapshot) {
      return false;
    }

    const normalize = (value) => (value === undefined || value === null ? '' : String(value).trim());

    return (
      normalize(payload.name) === normalize(editingUserSnapshot.name) &&
      normalize(payload.email).toLowerCase() === normalize(editingUserSnapshot.email).toLowerCase() &&
      normalize(payload.password) === normalize(editingUserSnapshot.password) &&
      normalize(payload.role) === normalize(editingUserSnapshot.role) &&
      normalize(payload.grade) === normalize(editingUserSnapshot.grade) &&
      normalize(payload.isActive) === normalize(editingUserSnapshot.isActive) &&
      normalize(payload.studentEmail) === normalize(editingUserSnapshot.studentEmail) &&
      normalize(payload.parentPhone) === normalize(editingUserSnapshot.parentPhone)
    );
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
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
          <Typography variant="h6" fontWeight="bold">User Management</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', md: 'auto' }, flexDirection: { xs: 'column', sm: 'row' } }}>
            <FormControl size="small" sx={{ flex: { xs: '1 1 100%', sm: '1 1 120px' }, minWidth: { sm: 160 } }}>
              <InputLabel>Filter by Role</InputLabel>
              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                label="Filter by Role"
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="student">Students</MenuItem>
                <MenuItem value="teacher">Teachers</MenuItem>
                <MenuItem value="parent">Parents</MenuItem>
                <MenuItem value="admin">Admins</MenuItem>
              </Select>
            </FormControl>
            {fieldRow(
              <Search fontSize="small" />,
              <TextField
                size="small"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flex: { xs: '1 1 100%', sm: '1 1 200px' } }}
              />,
              true
            )}
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ width: { xs: '100%', sm: 'auto' }, py: 1 }}
              onClick={() => {
                setEditingUserId(null);
                setEditingUserSnapshot(null);
                setNewUser({ name: '', email: '', password: '', role: 'student', grade: '', studentEmail: '', parentPhone: '', status: 'active' });
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
                  sx={{ p: 2, borderRadius: 2, position: 'relative' }}
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
                      <Typography variant="caption" color="textSecondary">Class</Typography>
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
                          password: '',
                          role: user.role || 'student',
                          grade: user.grade || '',
                          studentEmail: '',
                          parentPhone: user.parentPhone || '',
                          status: (user.status === 'inactive' || user.isActive === false) ? 'inactive' : 'active'
                        });
                        setEditingUserSnapshot({
                          name: user.name || '',
                          email: user.email || '',
                          password: '',
                          role: user.role || 'student',
                          grade: user.grade ?? '',
                          studentEmail: '',
                          parentPhone: user.parentPhone || '',
                          isActive: !(user.status === 'inactive' || user.isActive === false)
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
                      onClick={() => {
                        openDeleteDialog(user);
                      }}
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
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell align="right">Actions</TableCell>
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
                    <TableRow key={user.id || user._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                            {(user.name || 'U').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{user.name || 'Unknown'}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {user.email || 'No email'}
                            </Typography>
                            {user.role === 'student' && user.parent && (
                              <Typography variant="caption" color="textSecondary" display="block">
                                Parent: {user.parent.name} ({user.parent.email})
                              </Typography>
                            )}
                          </Box>
                        </Box>
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
                      <TableCell>{user.lastLogin || 'Never'}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingUserId(user.id || user._id);
                            setNewUser({
                              name: user.name || '',
                              email: user.email || '',
                              password: '',
                              role: user.role || 'student',
                              grade: user.grade || '',
                              studentEmail: '',
                              parentPhone: user.parentPhone || '',
                              status: (user.status === 'inactive' || user.isActive === false) ? 'inactive' : 'active'
                            });
                            setEditingUserSnapshot({
                              name: user.name || '',
                              email: user.email || '',
                              password: '',
                              role: user.role || 'student',
                              grade: user.grade ?? '',
                              studentEmail: '',
                              parentPhone: user.parentPhone || '',
                              isActive: !(user.status === 'inactive' || user.isActive === false)
                            });
                            setOpenUserDialog(true);
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            openDeleteDialog(user);
                          }}
                        >
                          <Delete />
                        </IconButton>
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
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 700 }}>
          Delete User
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              mt: 1,
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.light',
              bgcolor: 'rgba(211, 47, 47, 0.06)'
            }}
          >
            <Typography variant="body1" fontWeight="bold" gutterBottom>
              Are you sure you want to delete {userToDelete?.name || 'this user'}?
            </Typography>
            <Typography variant="body2" color="textSecondary">
              This action is permanent and cannot be undone. The user will be removed from the system.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDeleteDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteUser}
            variant="contained"
            color="error"
            disabled={!userToDelete}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openUserDialog}
        onClose={() => {
          setOpenUserDialog(false);
          setEditingUserId(null);
          setEditingUserSnapshot(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editingUserId ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              {fieldRow(
                <Badge fontSize="small" />,
                <TextField
                  fullWidth
                  label="Full Name"
                  value={newUser.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewUser((prev) => ({ ...prev, name: val }));
                    setFormErrors((prev) => ({ ...prev, name: validateName(val, 'Full Name') }));
                  }}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              {fieldRow(
                <Email fontSize="small" />,
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  value={newUser.email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewUser((prev) => ({ ...prev, email: val }));
                    setFormErrors((prev) => ({ ...prev, email: validateEmail(val) }));
                  }}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              {fieldRow(
                <Lock fontSize="small" />,
                <TextField
                  fullWidth
                  type="password"
                  label={editingUserId ? 'Password (leave blank to keep current)' : 'Password (optional)'}
                  value={newUser.password}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewUser((prev) => ({ ...prev, password: val }));
                    if (val) {
                      setFormErrors((prev) => ({ ...prev, password: validatePassword(val) }));
                    } else {
                      setFormErrors((prev) => ({ ...prev, password: '' }));
                    }
                  }}
                  error={!!formErrors.password}
                  helperText={formErrors.password || (editingUserId ? 'Leave blank to keep the current password' : 'Leave blank to generate a temporary password')}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  label="Role"
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
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              {fieldRow(
                <School fontSize="small" />,
                <TextField
                  fullWidth
                  label={(newUser.role === 'student' || newUser.role === 'teacher') ? "Class" : "Class (N/A)"}
                  value={newUser.grade}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, '');
                    setNewUser((prev) => ({ ...prev, grade: val }));
                    if (newUser.role === 'student' || val) {
                      setFormErrors((prev) => ({ ...prev, grade: validatePositiveInteger(val, 'Class') }));
                    } else {
                      setFormErrors((prev) => ({ ...prev, grade: '' }));
                    }
                  }}
                  disabled={newUser.role !== 'student' && newUser.role !== 'teacher'}
                  error={!!formErrors.grade}
                  helperText={formErrors.grade}
                />
              )}
            </Grid>
            {(newUser.role === 'parent' || newUser.role === 'student') && (
              <Grid item xs={12} sm={6}>
                {fieldRow(
                  <Phone fontSize="small" />,
                  <TextField
                    fullWidth
                    label={newUser.role === 'student' ? "Parent Mobile (SMS notifications)" : "Parent Mobile Number"}
                    value={newUser.parentPhone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewUser((prev) => ({ ...prev, parentPhone: val }));
                      if (newUser.role === 'parent' || newUser.role === 'student') {
                        const phone = val.trim();
                        if (!phone && newUser.role === 'parent') {
                          setFormErrors(p => ({ ...p, parentPhone: 'Parent mobile number is required' }));
                        } else if (phone && !/^[+\d][\d\s()-]{6,19}$/.test(phone)) {
                          setFormErrors(p => ({ ...p, parentPhone: 'Enter a valid parent mobile number' }));
                        } else {
                          setFormErrors(p => ({ ...p, parentPhone: '' }));
                        }
                      }
                    }}
                    error={!!formErrors.parentPhone}
                    helperText={formErrors.parentPhone}
                    placeholder="+91 9876543210"
                  />
                )}
              </Grid>
            )}
            {newUser.role === 'parent' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                {fieldRow(
                  <Email fontSize="small" />,
                  <TextField
                    fullWidth
                    label="Student Email to Link"
                    value={newUser.studentEmail}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewUser((prev) => ({ ...prev, studentEmail: val }));
                      if (val.trim()) {
                        setFormErrors((prev) => ({ ...prev, studentEmail: validateEmail(val, 'Student Email') }));
                      } else {
                        setFormErrors((prev) => ({ ...prev, studentEmail: '' }));
                      }
                    }}
                    placeholder="Optional"
                    error={!!formErrors.studentEmail}
                    helperText={formErrors.studentEmail}
                  />
                )}
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
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
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setOpenUserDialog(false);
              setEditingUserId(null);
              setEditingUserSnapshot(null);
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
                const payload = buildUserPayload();

                let response;

                if (editingUserId) {
                  if (isEditUnchanged(payload)) {
                    toast('No changes detected to update.', { icon: '⚠️' });
                    return;
                  }
                  response = await api.put(`/api/users/${editingUserId}`, payload);
                  if (response?.data?.changed === false) {
                    toast('No changes detected to update.', { icon: '⚠️' });
                    return;
                  }
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

                setNewUser({ name: '', email: '', password: '', role: 'student', grade: '', studentEmail: '', parentPhone: '', status: 'active' });
                setOpenUserDialog(false);
                setEditingUserId(null);
                setEditingUserSnapshot(null);

                const tempPassword = response?.data?.temporaryPassword;
                if (!editingUserId && tempPassword) {
                  toast.success(`User added. Temporary password: ${tempPassword}`);
                } else if (editingUserId) {
                  toast.success(response?.data?.message || (editingUserId ? 'User updated successfully' : 'User added successfully'));
                } else {
                  toast.success(response?.data?.message || 'User added successfully');
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
    </Container>
  );
};

export default UserManagement;
