import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  Avatar,
  Divider,
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  EmojiEvents,
  School,
  Search,
  Star,
  StarBorder,
  ExpandMore,
  ExpandLess,
  WorkspacePremium,
  CheckCircle,
  AccessTime,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import { resolveAvatarSrc } from '../../utils/media';

const renderStars = (count, total = 5, size = 18) => (
  <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center' }}>
    {[...Array(total)].map((_, index) => (
      index < count ? (
        <Star key={index} sx={{ color: '#FFD93D', fontSize: size, filter: 'drop-shadow(0 0 4px #FFD93D)' }} />
      ) : (
        <StarBorder key={index} sx={{ color: 'rgba(0,109,91,0.18)', fontSize: size }} />
      )
    ))}
  </Box>
);

const StudentCard = ({ student, classData, studentDailyGoals }) => {
  const [expanded, setExpanded] = useState(false);
  const progress = studentDailyGoals[student.id];
  const goals = progress?.goals || [];
  const starsEarned = progress?.starsEarned || 0;
  const achievements = Array.isArray(student.Achievements) ? student.Achievements : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ borderRadius: 4, boxShadow: 2, overflow: 'hidden' }}>
        {/* Student Header */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            background: 'linear-gradient(135deg, rgba(0, 109, 91, 0.98) 0%, rgba(0, 137, 123, 0.92) 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={resolveAvatarSrc(student.avatar)}
              sx={{ width: 50, height: 50, bgcolor: 'rgba(255,255,255,0.18)', fontWeight: 'bold' }}
            >
              {student.name?.charAt(0)?.toUpperCase() || 'S'}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="900">{student.name}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>{student.email}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip
              icon={<Star sx={{ color: '#FFD93D !important', fontSize: '1rem !important' }} />}
              label={`${starsEarned}/5 today`}
              sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: 'white', fontWeight: 800 }}
            />
            <Chip
              icon={<EmojiEvents sx={{ color: '#fff !important' }} />}
              label={`${achievements.length} badges`}
              sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: 'white', fontWeight: 800 }}
            />
          </Box>
        </Box>

        <CardContent>
          {/* Daily Stars Row */}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 800 }}>
              Today's Stars
            </Typography>
            {renderStars(starsEarned)}
          </Box>

          {/* Today's Goals */}
          {goals.length > 0 && (
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
              {goals.map((goal) => (
                <Chip
                  key={goal.id}
                  label={`${goal.icon || ''} ${goal.label}`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    bgcolor: goal.completed ? 'rgba(76,175,80,0.12)' : 'rgba(209,138,196,0.06)',
                    color: goal.completed ? 'success.dark' : 'text.secondary',
                    border: goal.completed ? '1px solid rgba(76,175,80,0.3)' : '1px solid rgba(0,0,0,0.08)',
                  }}
                />
              ))}
            </Stack>
          )}

          <Divider sx={{ my: 1.5 }} />

          {/* Achievements History Toggle */}
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', py: 0.5 }}
            onClick={() => setExpanded(!expanded)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkspacePremium sx={{ color: '#FFD93D', fontSize: 20 }} />
              <Typography variant="body2" fontWeight={800}>
                Achievements History ({progress?.history ? progress.history.length : 0} days)
              </Typography>
            </Box>
            <IconButton size="small">
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Collapse in={expanded}>
            <Box sx={{ mt: 1.5 }}>
              {(!progress?.history || progress.history.length === 0) ? (
                <Box sx={{ py: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    No history available yet.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {progress.history.map((dayData, idx) => {
                    const dateStr = new Date(dayData.date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    });
                    return (
                      <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" fontWeight={800} color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {dateStr}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {dayData.goals.map(goal => (
                            <Chip
                              key={goal.id}
                              label={`${goal.icon || ''} ${goal.label}`}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                bgcolor: goal.completed ? 'rgba(76,175,80,0.12)' : 'rgba(209,138,196,0.06)',
                                color: goal.completed ? 'success.dark' : 'text.secondary',
                                border: goal.completed ? '1px solid rgba(76,175,80,0.3)' : '1px solid rgba(0,0,0,0.08)',
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const TeacherClassStudentsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [studentDailyGoals, setStudentDailyGoals] = useState({});
  const [columnFilters, setColumnFilters] = useState({
    student: '',
    achievement: ''
  });

  const normalizeGradeId = (student) => student?.Grade?.id ?? student?.GradeId ?? student?.grade ?? null;

  useEffect(() => {
    let active = true;

    const fetchClassData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/dashboard/teacher');
        const classes = Array.isArray(res.data?.classes) ? res.data.classes : [];
        const students = Array.isArray(res.data?.students) ? res.data.students : [];

        // Also try to fetch full student achievement data
        let enrichedStudents = students;
        try {
          const achievementsRes = await api.get('/api/achievements/all-students');
          const achievementMap = {};
          (achievementsRes.data?.students || achievementsRes.data || []).forEach(s => {
            achievementMap[s.id] = s.Achievements || [];
          });
          enrichedStudents = students.map(s => ({
            ...s,
            Achievements: achievementMap[s.id] ?? s.Achievements ?? [],
          }));
        } catch {
          // fallback: use Achievements already on student objects
        }

        const selectedClass = classes.find((grade) => String(grade.id) === String(classId));

        if (!selectedClass) {
          if (active) {
            setClassData(null);
            setStudentDailyGoals({});
          }
          toast.error('Class not found');
          return;
        }

        const classStudents = enrichedStudents.filter(
          (student) => Number(normalizeGradeId(student)) === Number(selectedClass.id)
        );

        const goalEntries = await Promise.all(
          classStudents.map(async (student) => {
            try {
              const goalRes = await api.get(`/api/achievements/student-daily-goal/${student.id}`);
              return [student.id, goalRes.data];
            } catch (error) {
              return [
                student.id,
                {
                  success: false,
                  goals: [],
                  starsEarned: 0,
                  message: error?.response?.data?.message || 'Unable to load daily stars',
                },
              ];
            }
          })
        );

        if (!active) return;

        setClassData({ ...selectedClass, students: classStudents });
        setStudentDailyGoals(Object.fromEntries(goalEntries));
      } catch (error) {
        if (active) {
          toast.error(error?.response?.data?.message || 'Failed to load class students');
          setClassData(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchClassData();
    return () => { active = false; };
  }, [classId]);

  const filteredStudents = useMemo(() => {
    const studentQuery = columnFilters.student.trim().toLowerCase();
    const achievementQuery = columnFilters.achievement.trim().toLowerCase();
    const students = Array.isArray(classData?.students) ? classData.students : [];

    return students.filter((student) => {
      const studentClass = classData?.name?.toLowerCase() || '';
      
      const matchesStudent = !studentQuery || 
                             String(student.name || '').toLowerCase().includes(studentQuery) ||
                             String(student.email || '').toLowerCase().includes(studentQuery) ||
                             studentClass.includes(studentQuery);

      const progress = studentDailyGoals[student.id];
      const goalNames = (progress?.goals || []).map((goal) => String(goal.label || '')).join(' ').toLowerCase();
      const achievementNames = (student.Achievements || []).map(a => String(a.name || a.title || '')).join(' ').toLowerCase();
      
      const matchesAchievement = !achievementQuery || 
                                 goalNames.includes(achievementQuery) ||
                                 achievementNames.includes(achievementQuery);

      return matchesStudent && matchesAchievement;
    });
  }, [classData?.students, columnFilters, studentDailyGoals]);

  const selectedClassName = classData?.name || classData?.level || 'Class';
  const totalStars = filteredStudents.reduce((sum, s) => sum + (studentDailyGoals[s.id]?.starsEarned || 0), 0);
  const activeEarners = filteredStudents.filter((s) => (studentDailyGoals[s.id]?.starsEarned || 0) > 0).length;
  const totalAchievements = filteredStudents.reduce((sum, s) => sum + (s.Achievements?.length || 0), 0);

  if (loading) {
    return (
      <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, px: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2, alignItems: { xs: 'flex-start', sm: 'center' } }}>
        <Box>
          <Typography variant="h4" fontWeight="900" gutterBottom>
            {selectedClassName} — Students & Achievements
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Daily star progress and full achievement history for every student in this class.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/achievements')} sx={{ borderRadius: 2, flexShrink: 0 }}>
          Back to Classes
        </Button>
      </Box>

      {!classData ? (
        <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="800" gutterBottom>Class not found</Typography>
          <Typography color="textSecondary">Please go back and select a valid class.</Typography>
        </Paper>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }} alignItems="stretch">
            {[
              { label: 'Students', value: classData.students.length, color: '#D18AC4' },
              { label: 'Daily Stars Today', value: totalStars, color: '#f59e0b' },
              { label: 'Active Earners', value: activeEarners, color: '#16a34a' },
              { label: 'Total Achievements', value: totalAchievements, color: '#7c3aed' },
            ].map((stat) => (
              <Grid item xs={12} sm={6} md={3} key={stat.label} sx={{ display: 'flex' }}>
                <Card sx={{
                  borderRadius: 4,
                  boxShadow: 2,
                  bgcolor: stat.color,
                  color: 'white',
                  width: '100%',
                  minHeight: 100,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <CardContent sx={{ py: '16px !important', px: 2.5, width: '100%' }}>
                    <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" fontWeight="900" sx={{ mt: 0.5 }}>
                      {stat.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Search */}
          <Paper sx={{ p: 2.5, mb: 3, borderRadius: 4, boxShadow: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search Student or Class"
                  placeholder="Name, Email or Class..."
                  value={columnFilters.student}
                  onChange={(e) => setColumnFilters(prev => ({ ...prev, student: e.target.value }))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Filter by Achievement"
                  placeholder="Achievement name, goal..."
                  value={columnFilters.achievement}
                  onChange={(e) => setColumnFilters(prev => ({ ...prev, achievement: e.target.value }))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmojiEvents />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Student Cards */}
          <Grid container spacing={3}>
            {filteredStudents.length > 0 ? filteredStudents.map((student) => (
              <Grid item xs={12} md={6} key={student.id}>
                <StudentCard
                  student={student}
                  classData={classData}
                  studentDailyGoals={studentDailyGoals}
                />
              </Grid>
            )) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
                  <School sx={{ fontSize: 48, color: 'divider', mb: 1 }} />
                  <Typography variant="h6" fontWeight="800" gutterBottom>No students found</Typography>
                  <Typography color="textSecondary">Try a different search term or choose another class.</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default TeacherClassStudentsPage;
