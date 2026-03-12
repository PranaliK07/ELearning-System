import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeContext } from './context/ThemeContext';
import { NotificationProvider } from './context/notificationContext';
import { ProgressProvider } from './context/ProgressContext';
import ProtectedRoute from './features/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import StudentDashboard from './features/Dashboard/StudentDashboard';
import TeacherDashboard from './features/Dashboard/TeacherDashboard';
import AdminDashboard from './features/Dashboard/AdminDashboard';
import DashboardRouter from './features/Dashboard/DashboardRouter';

import GradeSelect from './features/study/GradeSelect';
import SubjectSelect from './features/study/SubjectSelect';
import TopicList from './features/study/TopicList';
import VideoView from './features/play/VideoView';
import WatchTimeStats from './features/progress/WatchTimeStats';
import LessonContent from './features/content/lessonContent';
import QuizStart from './features/quiz/quizStart';
import QuizRunner from './features/quiz/quizRunner';
import QuizResult from './features/quiz/quizResult';
import AchievementsPage from './features/achievements/AchievementsPage';
import ProfileView from './features/profile/ProfileView';
import EditProfile from './features/profile/EditProfile';
import InstagramFeed from './features/feed/InstagramFeed';
import ContentManagement from './features/admin/ContentManagement';



function App() {
  const [mode, setMode] = React.useState('light');

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#3f51b5',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
      },
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontFamily: '"Comic Neue", cursive',
      },
      h2: {
        fontFamily: '"Comic Neue", cursive',
      },
      h3: {
        fontFamily: '"Comic Neue", cursive',
      },
      h4: {
        fontFamily: '"Comic Neue", cursive',
      },
      h5: {
        fontFamily: '"Comic Neue", cursive',
      },
      h6: {
        fontFamily: '"Comic Neue", cursive',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 30,
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 20px -10px rgba(0,0,0,0.2)',
            },
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <AuthProvider>
            <ProgressProvider>
              <Router>
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      borderRadius: '20px',
                      background: mode === 'light' ? '#fff' : '#333',
                      color: mode === 'light' ? '#333' : '#fff',
                    },
                  }}
                />
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected routes with layout */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/dashboard" replace />} />

                    {/* Dashboard routes */}
                    <Route path="dashboard" element={
                      <ProtectedRoute roles={['student', 'teacher', 'admin']}>
                        <DashboardRouter />
                      </ProtectedRoute>
                    } />


                    {/* Study routes */}
                    <Route path="study">
                      <Route index element={<GradeSelect />} />
                      <Route path="grade/:gradeId" element={<SubjectSelect />} />
                      <Route path="subject/:subjectId" element={<TopicList />} />
                      <Route path="topic/:topicId" element={<LessonContent />} />
                    </Route>

                    <Route path="feed" element={<InstagramFeed />} />

                    {/* Admin/Teacher routes */}
                    <Route path="admin/content/create" element={
                      <ProtectedRoute roles={['admin', 'teacher']}>
                        <ContentManagement />
                      </ProtectedRoute>
                    } />


                    {/* Play routes */}

                    <Route path="play">
                      <Route path=":contentId" element={<VideoView />} />
                    </Route>

                    {/* Progress routes */}
                    <Route path="progress">
                      <Route index element={<WatchTimeStats />} />
                      <Route path="weekly" element={<WatchTimeStats weekly />} />
                    </Route>

                    {/* Quiz routes */}
                    <Route path="quiz">
                      <Route path=":quizId/start" element={<QuizStart />} />
                      <Route path=":quizId/run" element={<QuizRunner />} />
                      <Route path=":quizId/result" element={<QuizResult />} />
                    </Route>

                    {/* Achievements */}
                    <Route path="achievements" element={<AchievementsPage />} />

                    {/* Profile */}
                    <Route path="profile">
                      <Route index element={<ProfileView />} />
                      <Route path="edit" element={<EditProfile />} />
                    </Route>
                  </Route>
                </Routes>
              </Router>
            </ProgressProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;