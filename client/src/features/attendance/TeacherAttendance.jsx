import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, ImageRun, Packer, PageOrientation, Paragraph, Table as DocxTable, TableCell as DocxTableCell, TableRow as DocxTableRow, TextRun, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import api from '../../utils/axios';
import { resolveAvatarSrc } from '../../utils/media';
import logoUrl from '../../img/els-logo.png';

const todayDateOnly = () => new Date().toISOString().slice(0, 10);
const shiftDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const PLATFORM_NAME = 'Kids Learn';
const PLATFORM_SUBTITLE = 'Learning Platform';
const STATUS_PRESENT = 'present';
const STATUS_ABSENT = 'absent';

const formatDateLabel = (dateOnly, compact = false) => {
  try {
    const d = new Date(dateOnly);
    if (compact) return String(d.getDate());
    return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short' }).format(d);
  } catch {
    return String(dateOnly || '');
  }
};

const TeacherAttendance = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [classes, setClasses] = useState([]);
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [date, setDate] = useState(todayDateOnly());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportFrom, setReportFrom] = useState(shiftDays(-30));
  const [reportTo, setReportTo] = useState(todayDateOnly());
  const [report, setReport] = useState({ dates: [], students: [], attendance: [], grade: null, from: null, to: null });

  const fetchClasses = async () => {
    const res = await api.get('/api/grades');
    const list = Array.isArray(res.data) ? res.data : [];
    setClasses(list);
    if (!selectedGradeId && list.length) {
      setSelectedGradeId(String(list[0].id));
    }
  };

  const fetchAttendance = async (gradeId, dateOnly) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/attendance/grade/${gradeId}`, { params: { date: dateOnly } });
      const students = Array.isArray(res.data?.students) ? res.data.students : [];
      setRows(
        students.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          avatar: s.avatar,
          status: s.attendance?.status || 'absent',
          note: s.attendance?.note || ''
        }))
      );
    } catch (err) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await fetchClasses();
      } catch (err) {
        toast.error('Failed to load classes');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedGradeId) return;
    fetchAttendance(selectedGradeId, date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGradeId, date]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q));
  }, [rows, search]);

  const presentCount = useMemo(() => rows.filter((r) => r.status === 'present').length, [rows]);
  const absentCount = useMemo(() => rows.filter((r) => r.status === 'absent').length, [rows]);

  const setAll = (status) => {
    setRows((prev) => prev.map((r) => ({ ...r, status })));
  };

  const updateRow = (id, patch) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const save = async () => {
    if (!selectedGradeId) return;
    try {
      setSaving(true);
      const records = rows.map((r) => ({ studentId: r.id, status: r.status, note: r.note }));
      await api.post(`/api/attendance/grade/${selectedGradeId}/mark`, { date, records });
      toast.success('Attendance saved');
      await fetchAttendance(selectedGradeId, date);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const loadReport = async () => {
    if (!selectedGradeId) return;
    try {
      setReportLoading(true);
      const res = await api.get(`/api/attendance/grade/${selectedGradeId}/report`, {
        params: { from: reportFrom, to: reportTo }
      });
      setReport({
        dates: Array.isArray(res.data?.dates) ? res.data.dates : [],
        students: Array.isArray(res.data?.students) ? res.data.students : [],
        attendance: Array.isArray(res.data?.attendance) ? res.data.attendance : [],
        grade: res.data?.grade || null,
        from: res.data?.from || reportFrom,
        to: res.data?.to || reportTo
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load report');
    } finally {
      setReportLoading(false);
    }
  };

  const attendanceLookup = useMemo(() => {
    const map = new Map();
    for (const row of report.attendance || []) {
      if (!row?.studentId || !row?.date) continue;
      map.set(`${row.studentId}_${row.date}`, row);
    }
    return map;
  }, [report.attendance]);

  const renderStatus = (value) => {
    if (value === 'present') return <Chip size="small" color="success" variant="outlined" label="P" />;
    if (value === 'absent') return <Chip size="small" color="error" variant="outlined" label="A" />;
    return <Chip size="small" variant="outlined" label="-" />;
  };

  const buildExportMatrix = () => {
    const dates = report.dates || [];
    const students = report.students || [];
    const isCompact = dates.length > 10;
    const header = [
      'Student',
      'Email',
      ...dates.map((d) => formatDateLabel(d, isCompact)),
      'Pres.',
      'Abs.',
      'Tot.',
      'Att. %'
    ];

    const body = students.map((s) => {
      let presentCount = 0;
      let absentCount = 0;
      let markedCount = 0;

      const row = [s.name || '', s.email || ''];
      for (const d of dates) {
        const rec = attendanceLookup.get(`${s.id}_${d}`);
        const status = rec?.status?.toLowerCase();
        const v = status === STATUS_PRESENT ? 'P' : status === STATUS_ABSENT ? 'A' : '-';
        row.push(v);
        if (status === STATUS_PRESENT) presentCount += 1;
        if (status === STATUS_ABSENT) absentCount += 1;
        if (status === STATUS_PRESENT || status === STATUS_ABSENT) markedCount += 1;
      }

      const percent = markedCount ? Math.round((presentCount / markedCount) * 100) : 0;
      row.push(String(presentCount), String(absentCount), String(markedCount), `${percent}%`);
      return row;
    });

    return { header, body, dates };
  };

  const loadLogo = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    try {
      const res = await fetch(logoUrl, { signal: controller.signal });
      const blob = await res.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read logo'));
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      return { arrayBuffer, dataUrl };
    } finally {
      clearTimeout(timeout);
    }
  };

  const downloadExcel = () => {
    const { header, body } = buildExportMatrix();
    if (!body.length) return toast.error('Load a report first');

    const titleRows = [
      [PLATFORM_NAME],
      [PLATFORM_SUBTITLE],
      [''],
      [`Attendance Report${report?.grade?.name ? ` - ${report.grade.name}` : ''}`],
      [`Period: ${new Date(reportFrom).toLocaleDateString()} to ${new Date(reportTo).toLocaleDateString()}`],
      ['Legend: P = Present, A = Absent, - = Not marked'],
      ['']
    ];

    const aoa = [...titleRows, header, ...body];
    const worksheet = XLSX.utils.aoa_to_sheet(aoa);

    // Styling
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: header.length - 1 } }, // Name
      { s: { r: 1, c: 0 }, e: { r: 1, c: header.length - 1 } }, // Subtitle
      { s: { r: 3, c: 0 }, e: { r: 3, c: header.length - 1 } }, // Report Title
      { s: { r: 4, c: 0 }, e: { r: 4, c: header.length - 1 } }, // Period
      { s: { r: 5, c: 0 }, e: { r: 5, c: header.length - 1 } }  // Legend
    ];

    worksheet['!cols'] = [
      { wch: 25 }, // Student
      { wch: 30 }, // Email
      ...Array.from({ length: header.length - 2 }, () => ({ wch: 12 }))
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    const safeClass = (report?.grade?.name || `class_${selectedGradeId}`).replace(/[^\w\-]+/g, '_');
    XLSX.writeFile(workbook, `attendance_report_${safeClass}_${reportFrom}_to_${reportTo}.xlsx`);
    toast.success('Excel report downloaded');
  };

  const downloadPDF = async () => {
    try {
      const { header, body, dates } = buildExportMatrix();
      if (!body.length) return toast.error('Load a report first');

      const manyColumns = header.length > 10;
      const doc = new jsPDF({ orientation: manyColumns ? 'landscape' : 'portrait' });
      const pageWidth = doc.internal.pageSize.getWidth();
      
      let startY = 15;

      const logo = await loadLogo().catch(() => null);
      if (logo?.dataUrl) {
        try {
          doc.addImage(logo.dataUrl, 'PNG', 14, 10, 20, 20);
          doc.setFontSize(22);
          doc.setTextColor(176, 18, 91); // Dark Pink
          doc.setFont('helvetica', 'bold');
          doc.text(PLATFORM_NAME, 38, 20);
          
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.setFont('helvetica', 'normal');
          doc.text(PLATFORM_SUBTITLE, 38, 26);
          startY = 35;
        } catch (e) {
          console.error('Logo add failed', e);
        }
      }

      doc.setDrawColor(176, 18, 91);
      doc.setLineWidth(1);
      doc.line(14, startY - 5, pageWidth - 14, startY - 5);

      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      const title = `Attendance Report${report?.grade?.name ? ` - ${report.grade.name}` : ''}`;
      doc.text(title, 14, startY + 5);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`Period: ${new Date(reportFrom).toLocaleDateString()} to ${new Date(reportTo).toLocaleDateString()}`, 14, startY + 12);
      doc.text('Legend: P = Present, A = Absent, - = Not marked', 14, startY + 18);

      const isCompact = dates.length > 10;

      autoTable(doc, {
        startY: startY + 25,
        head: [header],
        body,
        theme: 'grid',
        styles: { 
          fontSize: isCompact ? 6 : 8, 
          cellPadding: isCompact ? 1 : 2, 
          halign: 'center', 
          valign: 'middle',
          lineWidth: 0.1,
          lineColor: [200, 200, 200]
        },
        headStyles: { 
          fillColor: [176, 18, 91], 
          textColor: 255, 
          fontStyle: 'bold',
          fontSize: isCompact ? 6 : 8
        },
        columnStyles: {
          0: { halign: 'left', fontStyle: 'bold', cellWidth: isCompact ? 35 : 45 },
          1: { halign: 'left', cellWidth: isCompact ? 40 : 50 }
        },
        didParseCell: (data) => {
          const col = data.column.index;
          const isDateCol = col >= 2 && col < 2 + (dates?.length || 0);
          const isStatCol = col >= 2 + (dates?.length || 0);
          
          if (data.section === 'head' && isDateCol) {
            data.cell.styles.fontSize = isCompact ? 5 : 7;
          }

          if (data.section === 'body') {
            if (isDateCol) {
              const v = String(data.cell.raw || '').trim().toUpperCase();
              if (v === 'P') {
                data.cell.styles.textColor = [34, 197, 94];
                data.cell.styles.fontStyle = 'bold';
              }
              if (v === 'A') {
                data.cell.styles.textColor = [239, 68, 68];
                data.cell.styles.fontStyle = 'bold';
              }
            }
            if (isStatCol) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [250, 250, 250];
            }
          }
        }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, doc.internal.pageSize.getHeight() - 10);
        doc.text(`Generated on ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.getHeight() - 10);
      }

      const safeClass = (report?.grade?.name || `class_${selectedGradeId}`).replace(/[^\w\-]+/g, '_');
      doc.save(`attendance_report_${safeClass}_${reportFrom}_to_${reportTo}.pdf`);
      toast.success('PDF report downloaded');
    } catch (err) {
      console.error('PDF download failed:', err);
      toast.error(err?.message || 'Failed to download PDF');
    }
  };

  const downloadWord = async () => {
    const { header, body } = buildExportMatrix();
    if (!body.length) return toast.error('Load a report first');

    let logoArrayBuffer = null;
    try {
      const logo = await loadLogo();
      logoArrayBuffer = logo?.arrayBuffer || null;
    } catch (e) {
      logoArrayBuffer = null;
    }

    const tableRows = [
      new DocxTableRow({
        children: header.map((h) =>
          new DocxTableCell({
            shading: { fill: 'B0125B' },
            children: [new Paragraph({ children: [new TextRun({ text: String(h), bold: true, color: 'FFFFFF' })], alignment: 'center' })]
          })
        )
      }),
      ...body.map(
        (r) =>
          new DocxTableRow({
            children: r.map((cell) => new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(cell ?? '') })], alignment: 'center' })] }))
          })
      )
    ];

    const isLandscape = header.length > 10;
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: { orientation: isLandscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT }
            }
          },
          children: [
            new Paragraph({
              children: [
                ...(logoArrayBuffer
                  ? [
                      new ImageRun({
                        data: logoArrayBuffer,
                        transformation: { width: 60, height: 60 }
                      })
                    ]
                  : []),
              ],
              spacing: { after: 120 }
            }),
            new Paragraph({
              children: [new TextRun({ text: PLATFORM_NAME, bold: true, size: 40, color: 'B0125B' })],
              spacing: { after: 60 }
            }),
            new Paragraph({
              children: [new TextRun({ text: PLATFORM_SUBTITLE, color: '666666' })],
              spacing: { after: 300 }
            }),
            new Paragraph({
              children: [new TextRun({ text: 'Attendance Report', bold: true, size: 28 })],
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: `Period: ${new Date(reportFrom).toLocaleDateString()} to ${new Date(reportTo).toLocaleDateString()}` })],
              spacing: { after: 100 }
            }),
            ...(report?.grade?.name
              ? [
                  new Paragraph({
                    children: [new TextRun({ text: `Class: ${report.grade.name}` })],
                    spacing: { after: 200 }
                  })
                ]
              : []),
            new Paragraph({
              children: [new TextRun({ text: 'Legend: P = Present, A = Absent, - = Not marked', size: 18, color: '666666' })],
              spacing: { after: 400 }
            }),
            new DocxTable({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows
            }),
            new Paragraph({
              children: [new TextRun({ text: `\nGenerated on ${new Date().toLocaleString()}`, size: 16, color: '999999' })],
              alignment: 'right'
            })
          ]
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    const safeClass = (report?.grade?.name || `class_${selectedGradeId}`).replace(/[^\w\-]+/g, '_');
    saveAs(blob, `attendance_report_${safeClass}_${reportFrom}_to_${reportTo}.docx`);
    toast.success('Word report downloaded');
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Attendance Management
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
        Mark daily attendance for your class.
      </Typography>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <FormControl fullWidth sx={{ minWidth: 220 }}>
              <InputLabel id="attendance-class-label">Class</InputLabel>
              <Select
                labelId="attendance-class-label"
                label="Class"
                value={selectedGradeId}
                onChange={(e) => setSelectedGradeId(String(e.target.value))}
              >
                {classes.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.name || `Class ${c.level || c.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Search student"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
              <Chip label={`P: ${presentCount}`} color="success" variant="outlined" size="small" />
              <Chip label={`A: ${absentCount}`} color="error" variant="outlined" size="small" />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button size="small" variant="outlined" onClick={() => setAll('present')} disabled={loading || saving} sx={{ flex: { xs: 1, sm: 'none' } }}>
                All Present
              </Button>
              <Button size="small" variant="outlined" onClick={() => setAll('absent')} disabled={loading || saving} sx={{ flex: { xs: 1, sm: 'none' } }}>
                All Absent
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
              <Button
                fullWidth={isMobile}
                variant="outlined"
                onClick={() => {
                  setReportOpen(true);
                  setReportFrom(shiftDays(-30));
                  setReportTo(todayDateOnly());
                  setReport({ dates: [], students: [], attendance: [] });
                }}
                disabled={!selectedGradeId}
              >
                Report
              </Button>
              <Button fullWidth={isMobile} variant="contained" onClick={save} disabled={loading || saving || rows.length === 0}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          </Stack>

          <Box sx={{ mt: 2 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : isMobile ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredRows.map((r) => (
                  <Paper key={r.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box
                        component="img"
                        alt={r.name}
                        src={resolveAvatarSrc(r.avatar)}
                        sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'grey.100' }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '';
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {r.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {r.email}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <ToggleButtonGroup
                        fullWidth
                        size="small"
                        value={r.status}
                        exclusive
                        onChange={(e, newStatus) => {
                          if (newStatus) updateRow(r.id, { status: newStatus });
                        }}
                        sx={{
                          '& .MuiToggleButton-root': {
                            py: 1,
                            '&.Mui-selected': {
                              bgcolor: (theme) => r.status === 'present' ? 'success.light' : 'error.light',
                              color: 'white',
                            }
                          }
                        }}
                      >
                        <ToggleButton value="present" color="success">Present</ToggleButton>
                        <ToggleButton value="absent" color="error">Absent</ToggleButton>
                      </ToggleButtonGroup>
                      
                      <TextField
                        size="small"
                        fullWidth
                        label="Note"
                        placeholder="Optional note"
                        value={r.note}
                        onChange={(e) => updateRow(r.id, { note: e.target.value })}
                      />
                    </Box>
                  </Paper>
                ))}
                {filteredRows.length === 0 && (
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 3 }}>
                    No students found.
                  </Typography>
                )}
              </Box>
            ) : (
              <TableContainer component={Box} sx={{ maxHeight: 520, overflowX: 'auto' }}>
                <Table stickyHeader size="small" sx={{ minWidth: 720 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Note</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRows.map((r) => (
                      <TableRow key={r.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              component="img"
                              alt={r.name}
                              src={resolveAvatarSrc(r.avatar)}
                              sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'grey.100' }}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '';
                              }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight={700} noWrap>
                                {r.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" noWrap>
                                {r.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ width: 220 }}>
                          <ToggleButtonGroup
                            size="small"
                            value={r.status}
                            exclusive
                            onChange={(e, newStatus) => {
                              if (newStatus) updateRow(r.id, { status: newStatus });
                            }}
                            sx={{
                              '& .MuiToggleButton-root': {
                                px: 2,
                                py: 0.5,
                                fontSize: '0.75rem',
                                '&.Mui-selected': {
                                  bgcolor: (theme) => r.status === 'present' ? 'success.light' : 'error.light',
                                  color: 'white',
                                  '&:hover': {
                                    bgcolor: (theme) => r.status === 'present' ? 'success.main' : 'error.main',
                                  }
                                }
                              }
                            }}
                          >
                            <ToggleButton value="present" color="success">
                              Present
                            </ToggleButton>
                            <ToggleButton value="absent" color="error">
                              Absent
                            </ToggleButton>
                          </ToggleButtonGroup>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            placeholder="Optional note"
                            value={r.note}
                            onChange={(e) => updateRow(r.id, { note: e.target.value })}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 3 }}>
                            No students found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </CardContent>
      </Card>

      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Attendance Report</DialogTitle>
        <DialogContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="From"
              type="date"
              value={reportFrom}
              onChange={(e) => setReportFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="To"
              type="date"
              value={reportTo}
              onChange={(e) => setReportTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="contained" onClick={loadReport} disabled={reportLoading}>
              {reportLoading ? 'Loading...' : 'Load'}
            </Button>
          </Stack>

          <Box sx={{ mt: 2 }}>
            {reportLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : report.students.length === 0 || report.dates.length === 0 ? (
              <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                Select a date range and click Load to view the report.
              </Typography>
            ) : (
              <TableContainer 
                component={Paper} 
                elevation={0}
                sx={{ 
                  maxHeight: 600, 
                  overflowX: 'auto',
                  borderRadius: 4,
                  border: '1px solid rgba(0,0,0,0.05)',
                  '&::-webkit-scrollbar': { height: 8 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 4 }
                }}
              >
                <Table stickyHeader size="small" sx={{ minWidth: Math.max(800, 200 + report.dates.length * 70) }}>
                  <TableHead>
                    <TableRow>
                      <TableCell 
                        sx={{ 
                          fontWeight: 800, 
                          position: 'sticky', 
                          left: 0, 
                          bgcolor: '#f8f9fa', 
                          zIndex: 3,
                          borderRight: '1px solid rgba(0,0,0,0.05)',
                          minWidth: 180
                        }}
                      >
                        Student
                      </TableCell>
                      {report.dates.map((d) => (
                        <TableCell 
                          key={d} 
                          align="center"
                          sx={{ 
                            fontWeight: 800, 
                            whiteSpace: 'nowrap',
                            bgcolor: '#f8f9fa',
                            color: '#0B1F3B',
                            fontSize: '0.75rem',
                            minWidth: 60
                          }}
                        >
                          {new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.students.map((s) => (
                      <TableRow key={s.id} hover>
                        <TableCell 
                          sx={{ 
                            position: 'sticky', 
                            left: 0, 
                            bgcolor: 'background.paper', 
                            zIndex: 1,
                            borderRight: '1px solid rgba(0,0,0,0.05)',
                            py: 1.5
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              component="img"
                              alt={s.name}
                              src={resolveAvatarSrc(s.avatar)}
                              sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'grey.100' }}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '';
                              }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight={700} noWrap>
                                {s.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" noWrap>
                                {s.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        {report.dates.map((d) => {
                          const row = attendanceLookup.get(`${s.id}_${d}`);
                          return (
                            <TableCell key={`${s.id}_${d}`} align="center">
                              {renderStatus(row?.status)}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={downloadPDF}
            variant="outlined"
            disabled={reportLoading || report.students.length === 0 || report.dates.length === 0}
          >
            Download PDF
          </Button>
          <Button
            onClick={downloadWord}
            variant="outlined"
            disabled={reportLoading || report.students.length === 0 || report.dates.length === 0}
          >
            Download Word
          </Button>
          <Button
            onClick={downloadExcel}
            variant="outlined"
            disabled={reportLoading || report.students.length === 0 || report.dates.length === 0}
          >
            Download Excel
          </Button>
          <Button onClick={() => setReportOpen(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeacherAttendance;
