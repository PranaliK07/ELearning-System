import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { toast } from 'react-hot-toast';
import api from '../../utils/axios';

const dateOnly = (d) => d.toISOString().slice(0, 10);

const StudentAttendance = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return dateOnly(d);
  });
  const [to, setTo] = useState(() => dateOnly(new Date()));
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const fetchMyAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/attendance/me', { params: { from, to } });
      const list = Array.isArray(res.data?.attendance) ? res.data.attendance : [];
      setRows(list);
    } catch (err) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  const summary = useMemo(() => {
    const present = rows.filter((r) => r.status === 'present').length;
    const absent = rows.filter((r) => r.status === 'absent').length;
    const today = dateOnly(new Date());
    const todayRow = rows.find((r) => r.date === today);
    return { present, absent, todayStatus: todayRow?.status || 'not_marked' };
  }, [rows]);

  const statusChip = (status) => {
    if (status === 'present') return <Chip label="Present" color="success" size="small" />;
    if (status === 'absent') return <Chip label="Absent" color="error" size="small" />;
    return <Chip label="Not marked" variant="outlined" size="small" />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Attendance
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
        View your daily attendance status (present/absent).
      </Typography>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 420px) auto' },
              gap: 2,
              alignItems: { xs: 'stretch', md: 'end' }
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(160px, 1fr))' },
                gap: 2
              }}
            >
              <TextField
                fullWidth
                label="From"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="To"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{
                flexWrap: 'wrap',
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                alignItems: 'center'
              }}
            >
              <Chip label={`Present: ${summary.present}`} color="success" variant="outlined" />
              <Chip label={`Absent: ${summary.absent}`} color="error" variant="outlined" />
              <Chip label={`Today: ${summary.todayStatus}`} variant="outlined" />
            </Stack>
          </Box>

          <Divider sx={{ my: 2 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : isMobile ? (
            <Stack spacing={1.5}>
              {rows.map((r) => (
                <Card key={`${r.date}-${r.status}`} variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack spacing={1}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 1,
                          flexWrap: 'wrap'
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={700}>
                          {new Date(r.date).toLocaleDateString()}
                        </Typography>
                        {statusChip(r.status)}
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ wordBreak: 'break-word' }}>
                        {r.note || '-'}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
              {rows.length === 0 && (
                <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 3 }}>
                  No attendance records in this date range.
                </Typography>
              )}
            </Stack>
          ) : (
            <TableContainer component={Box} sx={{ maxHeight: 520, overflowX: 'auto' }}>
              <Table stickyHeader size="small" sx={{ minWidth: 560 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Note</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={`${r.date}-${r.status}`} hover>
                      <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                      <TableCell>{statusChip(r.status)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {r.note || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 3 }}>
                          No attendance records in this date range.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default StudentAttendance;
