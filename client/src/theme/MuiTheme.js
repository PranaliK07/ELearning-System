import { createTheme } from '@mui/material/styles';

const BRAND_MINT = '#0F766E';
const BRAND_MINT_DARK = '#115E59';
const BRAND_MINT_LIGHT = '#14B8A6';
const BRAND_MINT_SOFT = '#ECFDF5';
const BRAND_MINT_DEEP = '#042F2E';
const BRAND_MINT_PAPER = '#10312E';

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? BRAND_MINT : '#99F6E4',
      contrastText: mode === 'light' ? '#fff' : '#042F2E'
    },
    secondary: {
      main: mode === 'light' ? BRAND_MINT_LIGHT : '#CCFBF1',
      contrastText: mode === 'light' ? '#fff' : '#042F2E'
    },
    success: { main: '#00C853' },
    text: {
      primary: mode === 'light' ? '#123B34' : '#F0FDF4',
      secondary: mode === 'light' ? '#4B6B63' : '#B7E4DA'
    },
    background: {
      default: mode === 'light' ? BRAND_MINT_SOFT : BRAND_MINT_DEEP,
      paper: mode === 'light' ? '#FFFFFF' : BRAND_MINT_PAPER,
    },
    divider: mode === 'light' ? 'rgba(15, 118, 110, 0.10)' : 'rgba(255, 255, 255, 0.10)',
    action: {
      hover: mode === 'light' ? 'rgba(15, 118, 110, 0.05)' : 'rgba(255, 255, 255, 0.06)',
      selected: mode === 'light' ? 'rgba(15, 118, 110, 0.10)' : 'rgba(255, 255, 255, 0.10)'
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
            color: mode === 'light' ? BRAND_MINT : '#F5F7FA',
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
            borderColor: mode === 'light' ? 'rgba(15, 118, 110, 0.18)' : 'rgba(255, 255, 255, 0.16)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'light' ? BRAND_MINT : '#F5F7FA',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'light' ? BRAND_MINT : '#F5F7FA',
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
            ? 'radial-gradient(circle at top left, rgba(15, 118, 110, 0.10), transparent 28%), radial-gradient(circle at 80% 20%, rgba(20, 184, 166, 0.15), transparent 22%), linear-gradient(180deg, #ffffff 0%, #effcf9 48%, #ffffff 100%)'
            : 'radial-gradient(circle at top left, rgba(15, 118, 110, 0.22), transparent 28%), radial-gradient(circle at 80% 20%, rgba(20, 184, 166, 0.18), transparent 24%), linear-gradient(180deg, #042F2E 0%, #0B3B38 52%, #042F2E 100%)',
          color: mode === 'light' ? '#123B34' : '#F5F7FA'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: mode === 'dark'
            ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 18%)'
            : 'none',
          backgroundColor: mode === 'dark' ? 'rgba(16, 49, 46, 0.96)' : '#FFFFFF',
          border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(15, 118, 110, 0.06)',
          boxShadow: mode === 'light'
            ? '0 4px 20px rgba(0,0,0,0.05)'
            : '0 12px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
          transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
          '&:hover': mode === 'dark' ? {
            borderColor: 'rgba(153, 246, 228, 0.4)',
            boxShadow: '0 16px 38px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          } : {
            borderColor: 'rgba(15, 118, 110, 0.12)',
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
          backgroundColor: mode === 'dark' ? 'rgba(16, 49, 46, 0.96)' : '#FFFFFF',
          border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(15, 118, 110, 0.06)',
          boxShadow: mode === 'light'
            ? '0 4px 20px rgba(0,0,0,0.05)'
            : '0 12px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
          transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
          '&:hover': mode === 'dark' ? {
            borderColor: 'rgba(153, 246, 228, 0.4)',
            boxShadow: '0 16px 38px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          } : {
            borderColor: 'rgba(15, 118, 110, 0.12)',
          }
        }
      }
    }
  },
});

export default getTheme;
