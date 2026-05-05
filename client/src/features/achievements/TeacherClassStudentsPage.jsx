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
        <StarBorder key={index} sx={{ color: 'rgba(15,118,110,0.18)', fontSize: size }} />
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
            background: 'linear-gradient(135deg, rgba(15,118,110,0.98) 0%, rgba(45,212,191,0.92) 100%)',
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
                    bgcolor: goal.completed ? 'rgba(76,175,80,0.12)' : 'rgba(15,118,110,0.06)',
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
                Achievements History ({achievements.length})
              </Typography>
            </Box>
            <IconButton size="small">
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Collapse in={expanded}>
            <Box sx={{ mt: 1.5 }}>
              {achievements.length === 0 ? (
                <Box sx={{ py: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    No achievements earned yet.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {achievements.map((ach, idx) => (
                    <Box
                      key={ach.id || idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,215,0,0.06)',
                        border: '1px solid rgba(255,215,0,0.2)',
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: '#FFD93D',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: '1.2rem',
                        }}
                      >
                        {ach.icon || '🏆'}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={800} noWrap>
                          {ach.name || ach.title || 'Achievement'}
                        </Typography>
                        {(ach.description || ach.desc) && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            {ach.description || ach.desc}
                          </Typography>
                        )}
                        {(ach.earnedAt || ach.createdAt) && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <AccessTime sx={{ fontSize: 12, color: 'text.disabled' }} />
                            <Typography variant="caption" color="textDisabled">
                              {new Date(ach.earnedAt || ach.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <CheckCircle sx={{ color: 'success.main', fontSize: 18, flexShrink: 0, mt: 0.25 }} />
                    </Box>
                  ))}
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
  const [searchTerm, setSearchTerm] = useState('');

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
    const query = searchTerm.trim().toLowerCase();
    const students = Array.isArray(classData?.students) ? classData.students : [];
    if (!query) return students;

    return students.filter((student) => {
      const progress = studentDailyGoals[student.id];
      const goalNames = (progress?.goals || []).map((goal) => String(goal.label || '')).join(' ').toLowerCase();
      const achievementNames = (student.Achievements || []).map(a => String(a.name || a.title || '')).join(' ').toLowerCase();
      return (
        String(student.name || '').toLowerCase().includes(query) ||
        String(student.email || '').toLowerCase().includes(query) ||
        goalNames.includes(query) ||
        achievementNames.includes(query) ||
        String(progress?.starsEarned || 0).includes(query) ||
        String(student.Achievements?.length || 0).includes(query)
      );
    });
  }, [classData?.students, searchTerm, studentDailyGoals]);

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
              { label: 'Students', value: classData.students.length, color: '#0F766E' },
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
            <TextField
              fullWidth
              size="small"
              placeholder="Search by student, goal, or achievement..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
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
