import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Paper,
  LinearProgress,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Stack,
  Collapse,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Star,
  StarBorder,
  WorkspacePremium,
  Download,
  CardMembership,
  Lock,
  School,
  Groups,
  EmojiEvents,
  Search,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import { resolveAvatarSrc } from '../../utils/media';
import Confetti from 'react-confetti';
import jsPDF from 'jspdf';
import { isAdminLikeRole } from '../../utils/roles';

const TeacherAchievementsView = ({ dashboardData }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [columnFilters, setColumnFilters] = useState({
    name: ''
  });
  const [expandedClassId, setExpandedClassId] = useState(null);
  const [studentDailyGoals, setStudentDailyGoals] = useState({});
  const [loadingClassId, setLoadingClassId] = useState(null);

  const classes = Array.isArray(dashboardData?.classes) ? dashboardData.classes : [];
  const students = Array.isArray(dashboardData?.students) ? dashboardData.students : [];

  const normalizeGradeId = (student) => student?.Grade?.id ?? student?.GradeId ?? student?.grade ?? null;
  const normalizeText = (value) => String(value || '').toLowerCase();
  const fallbackClasses = React.useMemo(() => {
    if (classes.length > 0) {
      return classes;
    }

    const grouped = new Map();

    students.forEach((student) => {
      const gradeId = normalizeGradeId(student);
      if (gradeId === null || gradeId === undefined || gradeId === '') {
        return;
      }

      const key = String(gradeId);
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: gradeId,
          name: student?.Grade?.name || (student?.grade ? `Class ${student.grade}` : `Class ${gradeId}`),
          level: student?.Grade?.level ?? student?.grade ?? null
        });
      }
    });

    return Array.from(grouped.values());
  }, [classes, students]);

  const classCards = fallbackClasses.map((grade) => {
    const gradeStudents = students.filter((student) => String(normalizeGradeId(student)) === String(grade.id));
    const classAchievements = gradeStudents.reduce((count, student) => count + (student.Achievements?.length || 0), 0);

    return {
      id: grade.id,
      name: grade.name || `Class ${grade.level || grade.id}`,
      level: grade.level,
      students: gradeStudents,
      achievementCount: classAchievements
    };
  });

  const unassignedStudents = students.filter((student) => {
    const gradeId = normalizeGradeId(student);
    return gradeId === null || gradeId === undefined || gradeId === '';
  });

  if (unassignedStudents.length > 0) {
    classCards.push({
      id: 'unassigned',
      name: 'Unassigned Students',
      level: null,
      students: unassignedStudents,
      achievementCount: unassignedStudents.reduce((count, student) => count + (student.Achievements?.length || 0), 0)
    });
  }

  const filteredClassCards = classCards.filter((classCard) => {
    const nameQuery = normalizeText(columnFilters.name).trim();

    return !nameQuery || 
           normalizeText(classCard.name).includes(nameQuery) ||
           classCard.students.some(s => normalizeText(s.name).includes(nameQuery) || normalizeText(s.email).includes(nameQuery));
  });

  const totalClassCount = classCards.filter((item) => item.id !== 'unassigned' || item.students.length > 0).length;
  const totalStudentCount = students.length;
  const totalAchievementCount = students.reduce((count, student) => count + (student.Achievements?.length || 0), 0);
  const studentsWithAchievements = students.filter((student) => (student.Achievements?.length || 0) > 0).length;
  const totalLoadedStars = Object.values(studentDailyGoals).reduce((count, item) => count + (item?.starsEarned || 0), 0);

  const loadStudentGoalsForClass = async (classCard) => {
    const missingStudents = classCard.students.filter((student) => !studentDailyGoals[student.id]);

    if (missingStudents.length === 0) {
      return;
    }

    setLoadingClassId(classCard.id);
    try {
      const responses = await Promise.all(
        missingStudents.map(async (student) => {
          try {
            const response = await axios.get(`/api/achievements/student-daily-goal/${student.id}`);
            return [student.id, response.data];
          } catch (error) {
            return [
              student.id,
              {
                success: false,
                goals: [],
                starsEarned: 0,
                message: error?.response?.data?.message || 'Unable to load daily stars'
              }
            ];
          }
        })
      );

      setStudentDailyGoals((prev) => ({
        ...prev,
        ...Object.fromEntries(responses)
      }));
    } finally {
      setLoadingClassId(null);
    }
  };

  const handleToggleClass = async (classCard) => {
    const nextExpanded = expandedClassId === classCard.id ? null : classCard.id;
    setExpandedClassId(nextExpanded);

    if (nextExpanded) {
      await loadStudentGoalsForClass(classCard);
    }
  };

  const renderStars = (count, total = 5, size = 18) => (
    <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center' }}>
      {[...Array(total)].map((_, index) => (
        index < count ? (
          <Star key={index} sx={{ color: '#FFD93D', fontSize: size, filter: 'drop-shadow(0 0 4px #FFD93D)' }} />
        ) : (
          <StarBorder key={index} sx={{ color: 'rgba(255,255,255,0.25)', fontSize: size }} />
        )
      ))}
    </Box>
  );

  return (
    <Box sx={{ py: 4, px: 1 }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            fontWeight="900"
            sx={{
              color: isDarkMode ? 'text.primary' : 'transparent',
              background: isDarkMode ? 'none' : 'linear-gradient(45deg, #006D5B 0%, #00897B 100%)',
              WebkitBackgroundClip: isDarkMode ? 'initial' : 'text',
              WebkitTextFillColor: isDarkMode ? 'inherit' : 'transparent',
              mb: 1,
              fontSize: { xs: '1.8rem', sm: '3rem' }
            }}
          >
            Achievements Overview
          </Typography>
          <Typography variant="h6" color="textSecondary" fontWeight="600">
            Review student achievements class by class and spot high performers quickly.
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 4, border: '1.5px solid rgba(0, 109, 91, 0.2)', boxShadow: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                  Classes
                </Typography>
                <Typography variant="h4" fontWeight="900" sx={{ mt: 0.5 }}>
                  {totalClassCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 4, border: '1.5px solid rgba(0, 109, 91, 0.2)', boxShadow: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                  Students
                </Typography>
                <Typography variant="h4" fontWeight="900" sx={{ mt: 0.5 }}>
                  {totalStudentCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 4, border: '1.5px solid rgba(0, 109, 91, 0.2)', boxShadow: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                  Achievements
                </Typography>
                <Typography variant="h4" fontWeight="900" sx={{ mt: 0.5 }}>
                  {totalAchievementCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 4, border: '1.5px solid rgba(0, 109, 91, 0.2)', boxShadow: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                  Active Earners
                </Typography>
                <Typography variant="h4" fontWeight="900" sx={{ mt: 0.5 }}>
                  {studentsWithAchievements}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2.5, mb: 3, borderRadius: 4, border: '1.5px solid rgba(0, 109, 91, 0.15)', boxShadow: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Filter by Class or Student Name"
                placeholder="Search..."
                value={columnFilters.name}
                onChange={(e) => setColumnFilters(prev => ({ ...prev, name: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {filteredClassCards.length > 0 ? filteredClassCards.map((classCard) => (
            <Grid item xs={12} sm={6} md={4} key={classCard.id}>
              <Card
                onClick={() => navigate(`/achievements/class/${classCard.id}`)}
                sx={{
                  borderRadius: 4,
                  border: '1.5px solid rgba(0, 109, 91, 0.25)',
                  boxShadow: 2,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 4,
                  }
                }}
              >
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    background: 'linear-gradient(135deg, rgba(0, 109, 91, 0.98) 0%, rgba(0, 137, 123, 0.92) 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1.5,
                    minHeight: 110
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.18)', p: 1.25, borderRadius: '50%', display: 'flex' }}>
                      <School />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="900">
                        {classCard.name}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.85 }}>
                        {classCard.students.length} student{classCard.students.length === 1 ? '' : 's'}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    icon={<EmojiEvents sx={{ color: '#fff !important' }} />}
                    label={`${classCard.achievementCount} achievements`}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.16)',
                      color: 'white',
                      fontWeight: 800,
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                  />
                </Box>

              </Card>
            </Grid>
          )) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="800" gutterBottom>
                  No class achievements found
                </Typography>
                <Typography color="textSecondary">
                  Try a different search term or check whether student achievement data is available yet.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </motion.div>
    </Box>
  );
};

const AchievementsPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [dailyGoal, setDailyGoal] = useState({ goals: [], starsEarned: 0 });
  const [teacherDashboard, setTeacherDashboard] = useState({
    students: [],
    classes: [],
    stats: {
      totalStudents: 0,
      activeClasses: 0,
      assignments: 0,
      avgProgress: 0,
    },
    recentSubmissions: [],
  });
  const [loading, setLoading] = useState(true);
  const viewMode = new URLSearchParams(location.search).get('view');
  const isOverviewView = viewMode === 'overview' || (!viewMode && (user?.role === 'teacher' || isAdminLikeRole(user?.role)));

  // Mock Certificates - Represents monthly progress rewards
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'long' });

  const certificates = [
    { id: 1, month: `${prevMonth} ${currentYear}`, title: 'Superstar Student Award', stars: 45, totalStars: 50, earned: true },
    { id: 2, month: `${currentMonth} ${currentYear}`, title: 'Creative Champion Award', stars: 12, totalStars: 60, earned: false },
  ];

  useEffect(() => {
    if (!user?.role) {
      return;
    }

    fetchData();
  }, [user?.role, isOverviewView]); // Add isOverviewView to dependencies

  const fetchData = async () => {
    try {
      if (!isOverviewView) {
        const res = await axios.get('/api/achievements/daily-goal');
        if (res.data.success) {
          setDailyGoal(res.data);
        }
        return;
      }

      // Only show loading if we don't have data yet to avoid flickering
      const hasData = isOverviewView 
        ? (teacherDashboard.students.length > 0 || teacherDashboard.classes.length > 0)
        : (dailyGoal.goals.length > 0);

      if (!hasData) {
        setLoading(true);
      }

      const [dashRes, reportsRes] = await Promise.all([
        api.get('/api/dashboard/teacher').catch(() => ({ data: {} })),
        api.get('/api/reports', { params: { period: 'monthly' } }).catch(() => ({ data: {} }))
      ]);
      
      const dashboardPayload = dashRes.data?.data || dashRes.data || {};
      const reportsPayload = reportsRes.data?.data || reportsRes.data || {};
      
      let finalStudents = dashboardPayload?.students || [];
      if (finalStudents.length === 0 && reportsPayload?.students) {
          finalStudents = reportsPayload.students;
      }
      
      setTeacherDashboard({
        students: finalStudents,
        classes: dashboardPayload?.classes || [],
        stats: dashboardPayload?.stats || {
          totalStudents: finalStudents.length,
          activeClasses: (dashboardPayload?.classes || []).length,
          assignments: 0,
          avgProgress: 0,
        },
        recentSubmissions: dashboardPayload?.recentSubmissions || [],
      });
    } catch (error) {
      if (isOverviewView) {
        console.error('Error fetching achievements:', error);
        toast.error('Failed to load achievements data. Please try again later.');
      } else {
        console.error('Error fetching teacher achievements:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (certTitle) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const studentName = user?.name || 'Valued Student';
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Background / Border
    doc.setDrawColor(11, 31, 59); // Dark blue primary
    doc.setLineWidth(5);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
    
    doc.setDrawColor(255, 217, 61); // Gold secondary
    doc.setLineWidth(1);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

    // 2. Decorative Corners
    doc.setFillColor(255, 217, 61);
    doc.triangle(8, 8, 25, 8, 8, 25, 'F');
    doc.triangle(pageWidth - 8, 8, pageWidth - 25, 8, pageWidth - 8, 25, 'F');
    doc.triangle(8, pageHeight - 8, 25, pageHeight - 8, 8, pageHeight - 25, 'F');
    doc.triangle(pageWidth - 8, pageHeight - 8, pageWidth - 25, pageHeight - 8, pageWidth - 8, pageHeight - 25, 'F');

    // 3. Header
    doc.setTextColor(11, 31, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(40);
    doc.text('CERTIFICATE OF ACHIEVEMENT', pageWidth / 2, 45, { align: 'center' });

    // 4. Sub-header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'italic');
    doc.text('This is to certify that', pageWidth / 2, 65, { align: 'center' });

    // 5. Student Name
    doc.setTextColor(176, 18, 91); // Crimson/Pink from the theme
    doc.setFontSize(45);
    doc.setFont('helvetica', 'bold');
    doc.text(studentName.toUpperCase(), pageWidth / 2, 85, { align: 'center' });

    // 6. Description
    doc.setTextColor(11, 31, 59);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.text('has successfully earned the', pageWidth / 2, 105, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(255, 132, 0); // Orange
    doc.text(certTitle.toUpperCase(), pageWidth / 2, 120, { align: 'center' });

    // 7. Footer
    doc.setTextColor(11, 31, 59);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Awarded on ${today}`, pageWidth / 2, 140, { align: 'center' });

    // 8. Signatures
    doc.setLineWidth(0.5);
    doc.line(40, 170, 110, 170);
    doc.line(pageWidth - 110, 170, pageWidth - 40, 170);
    
    doc.setFontSize(12);
    doc.text('Class Teacher', 75, 175, { align: 'center' });
    doc.text('Academic Head', pageWidth - 75, 175, { align: 'center' });

    // 9. Badge/Seal
    doc.setFillColor(255, 217, 61);
    doc.circle(pageWidth / 2, 170, 15, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text('EL-PRO', pageWidth / 2, 172, { align: 'center' });

    doc.save(`${certTitle.replace(/\s+/g, '_')}_Certificate.pdf`);
  };

  const renderStars = (count, total = 5, size = 30) => {
    return (
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
        {[...Array(total)].map((_, i) => (
          i < count ? 
          <Star key={i} sx={{ color: '#FFD93D', fontSize: size, filter: 'drop-shadow(0 0 5px #FFD93D)' }} /> : 
          <StarBorder key={i} sx={{ color: 'rgba(255,255,255,0.2)', fontSize: size }} />
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', py: 4, px: 1 }}>
      {isOverviewView ? (
        <TeacherAchievementsView dashboardData={teacherDashboard} />
      ) : (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Continuous Gentle Falling Stars Effect */}
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, pointerEvents: 'none' }}>
          <Confetti 
            recycle={dailyGoal.starsEarned < 5} 
            numberOfPieces={dailyGoal.starsEarned === 5 ? 400 : 30} 
            gravity={dailyGoal.starsEarned === 5 ? 0.15 : 0.05}
            colors={['#FFD93D', '#FFC107', '#FFA000']}
            drawShape={(ctx) => {
              const numPoints = 5;
              const outerRadius = 8;
              const innerRadius = 4;
              ctx.beginPath();
              for (let i = 0; i < numPoints * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (Math.PI / numPoints) * i;
                const x = Math.sin(angle) * radius;
                const y = Math.cos(angle) * radius;
                ctx.lineTo(x, y);
              }
              ctx.closePath();
              ctx.fill();
            }}
          />
        </Box>

        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography
            variant="h3"
            fontWeight="900"
            sx={{
              background: 'linear-gradient(45deg, #FFD93D 30%, #FF8400 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
              fontSize: { xs: '1.6rem', sm: '3rem' }
            }}
          >
            {user?.name?.split(' ')[0] || 'Student'} you get {dailyGoal.starsEarned > 0 ? '⭐'.repeat(dailyGoal.starsEarned) : '⭐'} today .
          </Typography>
          <Typography variant="h6" color="textSecondary" fontWeight="600">
            {dailyGoal.starsEarned === 5 
              ? 'Great job! 🌟 You have completed all missions for today.' 
              : 'Earn 5 stars every day to win your monthly certificate!'}
          </Typography>
        </Box>

        {/* 1. STARS SECTION - Daily Missions */}
        <Typography variant="h5" fontWeight="800" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <Star sx={{ mr: 1, color: '#FFD93D' }} /> Daily Mission Control
        </Typography>

        <Paper sx={{ 
          p: 4, 
          mb: 8, 
          borderRadius: 6, 
          background: 'linear-gradient(135deg, #006D5B 0%, #00897B 100%)',
          color: '#ffffff',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 10px 40px rgba(0, 109, 91, 0.4)'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography variant="h5" fontWeight="800">Your Progress Today</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Collect all 5 stars to unlock the best certificates!</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', bgcolor: 'rgba(0,0,0,0.2)', p: 1.5, borderRadius: 4, minWidth: 200 }}>
                {renderStars(dailyGoal.starsEarned, 5, 32)}
                <Typography variant="caption" sx={{ fontWeight: 900, mt: 0.5, display: 'block', color: '#FFD93D' }}>
                  {dailyGoal.starsEarned === 5 ? 'MAX STAR POWER! 🚀' : `${dailyGoal.starsEarned}/5 STARS EARNED`}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              {(dailyGoal.goals || []).map((goal) => (
                <Grid item xs={6} sm={4} md={2.4} key={goal.id}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 4, 
                    bgcolor: goal.completed ? '#006D5B' : 'rgba(0, 109, 91, 0.3)', 
                    border: `2px solid ${goal.completed ? '#FFD93D' : 'rgba(255,255,255,0.1)'}`, // Golden border when done
                    textAlign: 'center',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    boxShadow: goal.completed ? '0 8px 20px rgba(0, 109, 91, 0.4)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 120
                  }}>
                    <motion.div animate={goal.completed ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: Infinity, duration: 2.5 }}>
                      {goal.completed ? (
                        <Star sx={{ fontSize: 40, color: '#FFD93D', mb: 1, filter: 'drop-shadow(0 0 10px rgba(255, 217, 61, 0.6))' }} />
                      ) : (
                        <StarBorder sx={{ fontSize: 40, color: 'rgba(255,255,255,0.3)', mb: 1 }} />
                      )}
                    </motion.div>
                    <Typography variant="caption" fontWeight="900" sx={{ mb: 0.5, lineHeight: 1 }}>
                      {goal.label === 'Lesson Practice' ? 'Notes' : (goal.label || goal.id)}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        opacity: goal.completed ? 1 : 0.7, 
                        fontWeight: 900, 
                        fontSize: '0.65rem',
                        bgcolor: goal.completed ? '#FFD93D' : 'transparent',
                        color: goal.completed ? '#006D5B' : 'inherit',
                        px: 1,
                        borderRadius: 1
                      }}
                    >
                        {goal.completed ? 'DONE ✨' : 'PENDING'}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
        </Paper>

        {/* 2. CERTIFICATE SECTION - Monthly Progress */}
        <Typography variant="h5" fontWeight="800" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <WorkspacePremium sx={{ mr: 1, color: '#FF6B6B' }} /> Your Certificates
        </Typography>

        <Grid container spacing={4}>
          {certificates.map((cert) => (
            <Grid size={{ xs: 12, md: 6 }} key={cert.id}>
              <Card sx={{ 
                borderRadius: 5, 
                border: cert.earned ? '2px solid #FFD93D' : '1.5px solid rgba(0, 0, 0, 0.15)',
                boxShadow: cert.earned ? '0 10px 30px rgba(255, 217, 61, 0.2)' : 'none',
                opacity: cert.earned ? 1 : 0.8,
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                    p: 3, 
                    background: cert.earned ? 'linear-gradient(45deg, #FFF9C4 0%, #FFFDE7 100%)' : '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3
                }}>
                    <Box sx={{ 
                        width: 80, 
                        height: 80, 
                        bgcolor: cert.earned ? '#FFD93D' : '#e0e0e0',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <CardMembership sx={{ fontSize: 40, color: cert.earned ? 'white' : 'grey.600' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" fontWeight="800" color="primary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                            {cert.month}
                        </Typography>
                        <Typography variant="h6" fontWeight="900" sx={{ mb: 0.5 }}>{cert.title}</Typography>
                        <Typography variant="body2" color="textSecondary">
                            {cert.earned ? 'Earned! Download your prize.' : `Need ${cert.totalStars - cert.stars} more stars to unlock!`}
                        </Typography>
                    </Box>
                </Box>
                <CardContent sx={{ bgcolor: 'white' }}>
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" fontWeight="800">Stars Progress</Typography>
                            <Typography variant="caption" fontWeight="800">{cert.stars}/{cert.totalStars}</Typography>
                        </Box>
                        <LinearProgress 
                            variant="determinate" 
                            value={(cert.stars / cert.totalStars) * 100} 
                            sx={{ 
                                height: 10, 
                                borderRadius: 5,
                                bgcolor: '#f0f0f0',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: cert.earned ? '#FFD93D' : '#4ECDC4'
                                }
                            }}
                        />
                    </Box>
                    <Button 
                        fullWidth 
                        variant="contained" 
                        disabled={!cert.earned}
                        startIcon={cert.earned ? <Download /> : <Lock />}
                        onClick={() => handleDownload(cert.title)}
                        sx={{ 
                            borderRadius: 3, 
                            fontWeight: 800,
                            py: 1,
                            background: cert.earned ? 'linear-gradient(45deg, #FFD93D 0%, #FF8400 100%)' : '#e0e0e0',
                            boxShadow: cert.earned ? '0 4px 15px rgba(255, 132, 0, 0.3)' : 'none',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #FFCA28 0%, #F57C00 100%)'
                            }
                        }}
                    >
                        {cert.earned ? 'Download Certificate' : 'Locked'}
                    </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ 
          mt: 8, 
          p: 4, 
          textAlign: 'center', 
          background: 'linear-gradient(135deg, #006D5B 0%, #004D40 100%)', 
          borderRadius: 6, 
          border: '2px dashed rgba(255,255,255,0.4)',
          color: 'white',
          boxShadow: '0 10px 30px rgba(0, 109, 91, 0.2)'
        }}>
            <Typography variant="body1" fontWeight="700">
                🎓 Keep studying every day! Top students get a physical certificate mailed home!
            </Typography>
        </Box>
      </motion.div>
      )}
    </Box>
  );
};

export default AchievementsPage;
