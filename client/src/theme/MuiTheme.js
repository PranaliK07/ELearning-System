import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => {
  const primaryColor = '#006D5B'; // Dark Mint
  const secondaryColor = '#008C75'; // Medium Dark Mint
  const lightBg = '#F8FAFC'; // Brighter, cleaner light background

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryColor,
        light: '#00A389',
        dark: '#004D40',
        contrastText: '#ffffff',
      },
      secondary: {
        main: secondaryColor,
        light: '#00D09E',
        dark: '#005D4D',
      },
      success: {
        main: '#065F46',
      },
      background: {
        default: mode === 'light' ? lightBg : '#06100E',
        paper: mode === 'light' ? '#ffffff' : '#0B1A17',
      },
      text: {
        primary: mode === 'light' ? '#061D19' : '#F0FDF9',
        secondary: mode === 'light' ? '#1A4D45' : '#88B0A8',
      },
      divider: mode === 'light' ? 'rgba(0, 109, 91, 0.1)' : 'rgba(255, 255, 255, 0.08)',
    },
    typography: {
      fontFamily: "'Inter', 'Outfit', sans-serif",
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { 
            textTransform: 'none', 
            fontWeight: 600, 
            borderRadius: '10px',
            padding: '8px 24px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: `0 4px 12px ${mode === 'light' ? 'rgba(0, 109, 91, 0.2)' : 'rgba(0, 0, 0, 0.4)'}`,
            }
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: mode === 'light' ? '1px solid rgba(0, 109, 91, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: mode === 'light' ? '0 2px 8px rgba(0, 109, 91, 0.05)' : 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: mode === 'light' ? '1px solid rgba(0, 109, 91, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 12px 24px -8px ${mode === 'light' ? 'rgba(0, 109, 91, 0.25)' : 'rgba(0, 0, 0, 0.4)'}`,
            }
          }
        }
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'light' ? lightBg : '#06100E',
            backgroundImage: mode === 'light' 
              ? 'radial-gradient(at 0% 0%, rgba(0, 109, 91, 0.04) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(0, 140, 117, 0.04) 0, transparent 50%)'
              : 'none',
          }
        }
      }
    },
  });
};

export default getTheme;
