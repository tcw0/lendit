import React, { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Divider,
  Grid,
} from '@mui/material'
import { UsersService } from '@api/services/UsersService'
import { AuthContext } from 'src/context/AuthContext'
import { useSnackbar } from 'src/context/SnackbarContext'
import { UserDto } from '@api/models/UserDto'
import CloseButton from 'src/components/buttons/CloseButton'
import { Stack } from '@mui/system'
import { Edit } from '@mui/icons-material'
import ChangePasswordDialog from './ChangePasswordDialog'
import DeleteAccountDialog from './DeleteAccountDialog'

export default function SettingsTab() {
  const { showSnackBarWithError } = useSnackbar()
  const { userId } = React.useContext(AuthContext)

  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [editedValue, setEditedValue] = useState<string>('')
  const [editedField, setEditedField] = useState<
    'name' | 'description' | undefined
  >(undefined)

  const [openChangePasswordDialog, setOpenChangePasswordDialog] =
    useState(false)
  const [openDeleteAccountDialog, setOpenDeleteAccountDialog] = useState(false)

  const [user, setUser] = React.useState<UserDto | undefined>(undefined)

  // Reload user data on update
  const fetchUser = useCallback(async () => {
    if (userId) {
      try {
        const user: UserDto = await UsersService.getUserById(userId)
        setUser(user)
      } catch (error) {
        showSnackBarWithError(error)
      }
    }
  }, [userId, showSnackBarWithError])

  // Fetch user data on mount
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleOpenEditDialog = (
    currentValue: string,
    editedField: 'name' | 'description',
  ) => {
    setOpenEditDialog(true)
    setEditedValue(currentValue)
    setEditedField(editedField)
  }

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false)
    setEditedValue('')
    setEditedField(undefined)
  }

  const handleEditDialogSaveSettings = async () => {
    if (user && editedField) {
      try {
        const newUser: UserDto = await UsersService.updateUserById(user.id, {
          ...user,
          [editedField]: editedValue,
        })
        setUser(newUser)
      } catch (error) {
        showSnackBarWithError(error)
      }
    }
    handleCloseEditDialog()
  }

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
        p={2}
      >
        <Typography variant="h5">Settings</Typography>

        <Stack direction="column" spacing={2} width="90%" maxWidth="sm">
          <Grid container>
            <Grid item xs={9} sm={10}>
              <Typography variant="body1">Name</Typography>
            </Grid>
            <Grid item xs={3} sm={2}>
              <IconButton
                onClick={() => handleOpenEditDialog(user?.name || '', 'name')}
                size="small"
              >
                <Edit />
              </IconButton>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">{user?.name}</Typography>
            </Grid>
          </Grid>
          <Divider />
          <Grid container>
            <Grid item xs={9} sm={10}>
              <Typography variant="body1">Email</Typography>
            </Grid>
            <Grid item xs={3} sm={2} />
            <Grid item xs={12}>
              <Typography variant="body2">{user?.email}</Typography>
            </Grid>
          </Grid>
          <Divider />
          <Grid container>
            <Grid item xs={9} sm={10}>
              <Typography variant="body1">Description</Typography>
            </Grid>
            <Grid item xs={3} sm={2}>
              <IconButton
                onClick={() =>
                  handleOpenEditDialog(user?.description || '', 'description')
                }
                size="small"
              >
                <Edit />
              </IconButton>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">{user?.description}</Typography>
            </Grid>
          </Grid>
          <Divider />
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenChangePasswordDialog(true)}
            >
              Change password
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setOpenDeleteAccountDialog(true)}
            >
              Delete account
            </Button>
          </Stack>
        </Stack>
      </Box>

      <ChangePasswordDialog
        open={openChangePasswordDialog}
        handleClose={() => setOpenChangePasswordDialog(false)}
      />
      <DeleteAccountDialog
        open={openDeleteAccountDialog}
        handleClose={() => setOpenDeleteAccountDialog(false)}
      />
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        PaperProps={{
          style: {
            width: editedField === 'description' ? '90%' : undefined,
          },
        }}
      >
        <DialogTitle>
          Edit {editedField} <CloseButton handleClose={handleCloseEditDialog} />
        </DialogTitle>
        <DialogContent>
          <TextField
            name={editedField}
            value={editedValue}
            onChange={e => setEditedValue(e.target.value)}
            fullWidth
            multiline={editedField === 'description'}
            rows={editedField === 'description' ? 4 : 1}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCloseEditDialog}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditDialogSaveSettings}
            color="secondary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
