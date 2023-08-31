import { UsersService } from '@api/services/UsersService'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import CloseButton from 'src/components/buttons/CloseButton'
import { AuthContext } from 'src/context/AuthContext'
import { useSnackbar } from 'src/context/SnackbarContext'

type DeleteAccountDialogProps = {
  open: boolean
  handleClose: () => void
}

export default function DeleteAccountDialog(
  props: DeleteAccountDialogProps,
): JSX.Element {
  const { open, handleClose } = props
  const { userId, logout } = useContext(AuthContext)
  const { showSnackBarWithError, showSnackBarWithMessage } = useSnackbar()
  const navigate = useNavigate()

  const handleAccountDeletion = async () => {
    if (!userId) {
      return
    }
    try {
      await UsersService.deleteUserById(userId)
      showSnackBarWithMessage('Account deleted successfully', 'success')
      logout()
      handleClose()
      navigate('/')
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
        Delete Account
        <CloseButton handleClose={handleClose} />
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Are you sure you want to delete your account? This action is
          irreversible.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleAccountDeletion}
        >
          Confirm Account Deletion
        </Button>
      </DialogActions>
    </Dialog>
  )
}
