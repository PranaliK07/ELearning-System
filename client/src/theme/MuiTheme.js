import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#0B1F3B' : '#8AB4F8',
      contrastText: mode === 'light' ? '#fff' : '#0F1724'
    },
    secondary: {
      main: mode === 'light' ? '#B0125B' : '#F472B6',
      contrastText: mode === 'light' ? '#fff' : '#0F1724'
    },
    success: { main: '#00C853' },
    text: {
      primary: mode === 'light' ? '#183153' : '#F5F7FA',
      secondary: mode === 'light' ? '#5F6B7A' : '#AAB4C3'
    },
    background: {
      default: mode === 'light' ? '#F5F7FA' : '#0B1220',
      paper: mode === 'light' ? '#FFFFFF' : '#1A2740',
    },
    divider: mode === 'light' ? 'rgba(11, 31, 59, 0.08)' : 'rgba(255, 255, 255, 0.10)',
    action: {
      hover: mode === 'light' ? 'rgba(11, 31, 59, 0.04)' : 'rgba(255, 255, 255, 0.06)',
      selected: mode === 'light' ? 'rgba(11, 31, 59, 0.08)' : 'rgba(255, 255, 255, 0.10)'
    }
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, boxShadow: 'none' },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: mode === 'light' ? '#5F6B7A' : '#AAB4C3',
          '&.Mui-focused': {
            color: mode === 'light' ? '#0B1F3B' : '#F5F7FA',
          },
          '&.Mui-error': {
            color: '#d32f2f',
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: mode === 'light' ? '#5F6B7A' : '#AAB4C3',
          '&.Mui-error': {
            color: '#d32f2f',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: mode === 'light' ? '#183153' : '#F5F7FA',
          backgroundColor: 'transparent',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'light' ? 'rgba(11, 31, 59, 0.18)' : 'rgba(255, 255, 255, 0.16)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'light' ? '#0B1F3B' : '#F5F7FA',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'light' ? '#0B1F3B' : '#F5F7FA',
          },
        },
        input: {
          color: mode === 'light' ? '#183153' : '#F5F7FA',
          '&::placeholder': {
            opacity: 1,
            color: mode === 'light' ? '#5F6B7A' : '#AAB4C3',
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: mode === 'light'
            ? 'radial-gradient(circle at top left, rgba(11, 31, 59, 0.08), transparent 28%), radial-gradient(circle at 80% 20%, rgba(176, 18, 91, 0.14), transparent 22%), linear-gradient(180deg, #ffffff 0%, #fffef8 48%, #ffffff 100%)'
            : 'radial-gradient(circle at top left, rgba(64, 103, 178, 0.18), transparent 28%), radial-gradient(circle at 80% 20%, rgba(176, 18, 91, 0.18), transparent 24%), linear-gradient(180deg, #0f1724 0%, #111b2e 52%, #0f1724 100%)',
          color: mode === 'light' ? '#183153' : '#F5F7FA'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: mode === 'dark'
            ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 18%)'
            : 'none',
          backgroundColor: mode === 'dark' ? 'rgba(26, 39, 64, 0.96)' : '#FFFFFF',
          border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(11, 31, 59, 0.06)',
          boxShadow: mode === 'light'
            ? '0 4px 20px rgba(0,0,0,0.05)'
            : '0 12px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
          transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
          '&:hover': mode === 'dark' ? {
            borderColor: 'rgba(138, 180, 248, 0.4)',
            boxShadow: '0 16px 38px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          } : {
            borderColor: 'rgba(11, 31, 59, 0.12)',
          }
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: mode === 'dark'
            ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 18%)'
            : 'none',
          backgroundColor: mode === 'dark' ? 'rgba(26, 39, 64, 0.96)' : '#FFFFFF',
          border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(11, 31, 59, 0.06)',
          boxShadow: mode === 'light'
            ? '0 4px 20px rgba(0,0,0,0.05)'
            : '0 12px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
          transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
          '&:hover': mode === 'dark' ? {
            borderColor: 'rgba(138, 180, 248, 0.4)',
            boxShadow: '0 16px 38px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          } : {
            borderColor: 'rgba(11, 31, 59, 0.12)',
          }
        }
      }
    }
  },
});

export default getTheme;
