import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3525cd',
      dark: '#3323cc',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#5c5f61',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ba1a1a',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#0b1c30',
      secondary: '#464555',
    },
    divider: '#c7c4d8',
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    h1: {
      fontSize: '48px',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: '56px',
    },
    h2: {
      fontSize: '32px',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: '40px',
    },
    h3: {
      fontSize: '24px',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: '32px',
    },
    body1: {
      fontSize: '16px',
      lineHeight: '24px',
    },
    body2: {
      fontSize: '14px',
      lineHeight: '20px',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12, // matching the ROUND_EIGHT / 12px corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#ffffff',
          },
        },
      },
    },
  },
});

export default theme;
