import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../utils/axios';
import toast from 'react-hot-toast';
import { isAdminLikeRole } from '../utils/roles';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const tickMs = user?.role === 'demo' ? 1000 : 60000;
    const tick = () => setCurrentTime(Date.now());

    tick();
    const timer = setInterval(tick, tickMs);
    return () => clearInterval(timer);
  }, [user?.role, user?.trialEndsAt]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      const status = error?.response?.status;
      // Only force logout on explicit auth failures
      if (status === 401 || status === 403) {
        logout();
      } else {
        // Keep the session for transient/server errors
        toast.error('Unable to verify session. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(userData);
      
      toast.success('Welcome back! 🎉');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token, ...user } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      toast.success('Registration successful! 🎉');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = async (userData) => {
    try {
      const response = await axios.put('/api/auth/profile', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data?.user || response.data);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
      return { success: false };
    }
  };

  const value = {
    user,
    loading,
    token,
    currentTime,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isTeacher: user?.role === 'teacher',
    isAdmin: isAdminLikeRole(user?.role),
    isDemo: user?.role === 'demo'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
