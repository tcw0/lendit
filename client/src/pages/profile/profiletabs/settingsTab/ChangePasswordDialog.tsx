import { UsersService } from '@api/services/UsersService'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import React, { useContext, useEffect } from 'react'
import CloseButton from 'src/components/buttons/CloseButton'
import { AuthContext } from 'src/context/AuthContext'
import { useSnackbar } from 'src/context/SnackbarContext'

type ChangePasswordDialogProps = {
  open: boolean
  handleClose: () => void
}

export default function ChangePasswordDialog(
  props: ChangePasswordDialogProps,
): JSX.Element {
  const { userId } = useContext(AuthContext)
  const { showSnackBarWithError, showSnackBarWithMessage } = useSnackbar()
  const { open, handleClose } = props

  const [oldPassword, setOldPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [newPasswordRepeat, setNewPasswordRepeat] = React.useState('')

  const [passwordsMatch, setPasswordsMatch] = React.useState(true)

  const [oldPasswordPasswordMode, setOldPasswordPasswordMode] =
    React.useState(true)
  const [newPasswordPasswordMode, setNewPasswordPasswordMode] =
    React.useState(true)
  const [newPasswordRepeatPasswordMode, setNewPasswordRepeatPasswordMode] =
    React.useState(true)

  useEffect(() => {
    if (newPassword !== newPasswordRepeat) {
      setPasswordsMatch(false)
    } else {
      setPasswordsMatch(true)
    }
  }, [newPassword, newPasswordRepeat])

  const handleFullClose = () => {
    setOldPassword('')
    setNewPassword('')
    setNewPasswordRepeat('')

    setPasswordsMatch(true)

    setOldPasswordPasswordMode(true)
    setNewPasswordPasswordMode(true)
    setNewPasswordRepeatPasswordMode(true)
    handleClose()
  }

  const handlePasswordUpdate = async () => {
    if (!userId) {
      return
    }
    if (!oldPassword) {
      showSnackBarWithMessage('Please enter your old password', 'warning')
      return
    }
    if (!newPassword) {
      showSnackBarWithMessage('Please enter your new password', 'warning')
      return
    }
    if (!newPasswordRepeat) {
      showSnackBarWithMessage('Please repeat your new password', 'warning')
      return
    }
    if (!passwordsMatch) {
      showSnackBarWithMessage('Passwords do not match', 'warning')
      return
    }
    try {
      await UsersService.changePassword(userId, { oldPassword, newPassword })
      showSnackBarWithMessage('Password changed successfully', 'success')
      handleFullClose()
    } catch (error) {
      showSnackBarWithError(error)
    }
  }

  return (
    <Dialog
      open={open}
      PaperProps={{
        style: {
          width: '90%',
          maxWidth: 500,
        },
      }}
    >
      <DialogTitle>
        Change password
        <CloseButton handleClose={handleFullClose} />
      </DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} pt={1}>
          <TextField
            label="Old password"
            type={oldPasswordPasswordMode ? 'password' : 'text'}
            size="small"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setOldPasswordPasswordMode(mode => !mode)}
                    edge="end"
                  >
                    {oldPasswordPasswordMode ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="New password"
            type={newPasswordPasswordMode ? 'password' : 'text'}
            size="small"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setNewPasswordPasswordMode(mode => !mode)}
                    edge="end"
                  >
                    {newPasswordPasswordMode ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Confirm new password"
            type={newPasswordRepeatPasswordMode ? 'password' : 'text'}
            size="small"
            value={newPasswordRepeat}
            onChange={e => setNewPasswordRepeat(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setNewPasswordRepeatPasswordMode(mode => !mode)
                    }
                    edge="end"
                  >
                    {newPasswordRepeatPasswordMode ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {!passwordsMatch && (
            <Typography variant="caption">Passwords do not match.</Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={handleFullClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handlePasswordUpdate}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
