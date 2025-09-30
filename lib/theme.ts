import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF44AA',
    },
    background: {
      default: '#1A1A1A',
      paper: '#1A1A1A',
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#9E9E9E',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: {
      fontFamily: 'Satoshi, sans-serif',
    },
    h2: {
      fontFamily: 'Satoshi, sans-serif',
    },
    h3: {
      fontFamily: 'Satoshi, sans-serif',
    },
    h4: {
      fontFamily: 'Satoshi, sans-serif',
    },
    h5: {
      fontFamily: 'Satoshi, sans-serif',
    },
    h6: {
      fontFamily: 'Satoshi, sans-serif',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '&[lang="ar"]': {
            fontFamily: 'Amiri, serif',
          },
        },
        '*[lang="ar"]': {
          fontFamily: 'Amiri, serif',
        },
      },
    },
  },
});
