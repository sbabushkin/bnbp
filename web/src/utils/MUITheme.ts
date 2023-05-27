import { createTheme } from '@mui/material/styles';

const MUITheme = createTheme({
  components: {
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
          "&:hover": {
            backgroundColor: '#ccc',
          }
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          height: '38px',
          width: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          '-webkit-line-clamp': '2',
          '-webkit-box-orient': 'vertical',
        }
      }
    },
    MuiTypography: {
      styleOverrides: {
        subtitle2: {
          color: '#9b9b9b',
        }
      }
    },
    MuiModal: {
      styleOverrides: {
        root: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }
      }
    }
  }
});

export default MUITheme;
