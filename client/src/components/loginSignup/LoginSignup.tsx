import * as React from 'react'

// mui components
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Link,
  Box,
  Typography,
} from '@mui/material'

// references
import Login from './Login'
import Signup from './Signup'
import CloseButton from '../buttons/CloseButton'
import BackButton from '../buttons/BackButton'

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="/about">
        lendit
      </Link>{' '}
      {new Date().getFullYear()}.
    </Typography>
  )
}

export default function LoginSignup({
  openLogin,
  setOpenLogin,
}: {
  openLogin: boolean
  setOpenLogin: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [openSignup, setOpenSignup] = React.useState(false)
  const handleClose = () => {
    setOpenLogin(false)
    setOpenSignup(false)
  }
  const signupBack = () => {
    setOpenSignup(false)
  }

  return (
    <Dialog maxWidth="xs" open={openLogin} onClose={handleClose}>
      <DialogTitle>
        <Typography fontWeight="bold" align="center">
          {openSignup ? 'Sign up' : 'Log in or sign up'}
        </Typography>
        <CloseButton handleClose={handleClose} />
        {openSignup ? <BackButton handleBack={signupBack} /> : null}
      </DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderStyle: '',
          }}
        >
          <Typography variant="h6" fontWeight="bold" align="left" width="100%">
            Welcome to lendit
          </Typography>

          {!openSignup ? (
            <Login setOpenLogin={setOpenLogin} setOpenSignup={setOpenSignup} />
          ) : (
            <Signup handleClose={handleClose} />
          )}
        </Box>
        <Copyright />
      </DialogContent>
    </Dialog>
  )
}
