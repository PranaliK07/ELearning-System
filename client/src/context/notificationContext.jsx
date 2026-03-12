import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const notificationContext = createContext();

export const useNotification = () => {
  const context = useContext(notificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const showSuccess = (message) => showNotification(message, 'success');
  const showError = (message) => showNotification(message, 'error');
  const showWarning = (message) => showNotification(message, 'warning');
  const showInfo = (message) => showNotification(message, 'info');

  return (
    <notificationContext.Provider value={{
      showNotification,
      showSuccess,
      showError,
      showWarning,
      showInfo
    }}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={hideNotification} 
          severity={notification.severity}
          sx={{ 
            borderRadius: '20px',
            fontSize: '1rem',
            fontWeight: 500
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </notificationContext.Provider>
  );
};