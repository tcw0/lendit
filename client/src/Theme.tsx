import { createTheme } from '@mui/material'

const theme = createTheme({
  palette: {
    primary: {
      // lendit dark blue
      main: '#152944',
      contrastText: 'white',
    },
    secondary: {
      // lendit light green
      main: '#1EE6B6',
      contrastText: '#152944',
    },
    error: {
      main: '#F44336',
      contrastText: 'white',
    },
  },
})

export default theme
