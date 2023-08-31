import { Button, styled } from '@mui/material'

// just overwrite width and height in sx prop to adjust button size
const GreenButtonBase = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.secondary.main,
  '&:hover': {
    color: 'white',
    backgroundColor: theme.palette.secondary.main,
  },
  borderRadius: '20px',
  margin: '1rem',
  textTransform: 'none',
  fontWeight: 'bold',
}))

export default GreenButtonBase
