import { UserDto } from '@api/models/UserDto'
import { UsersService } from '@api/services/UsersService'
import { StarRateRounded } from '@mui/icons-material'
import { Button, Grid, Paper, Typography } from '@mui/material'
import { Box, Container, Stack, styled } from '@mui/system'
import React, { useContext } from 'react'
import LabeledOrPicturedAvatar from 'src/components/LabeledOrPicturedAvatar'
import { AuthContext } from 'src/context/AuthContext'
import { useSnackbar } from 'src/context/SnackbarContext'
import { displayRating } from 'src/helper/helper'

const EditButton = styled(Button)(({ theme }) => ({
  textTransform: 'capitalize',
  color: theme.palette.secondary.main,
  fontWeight: 'bold',
  textAlign: 'center',
})) as typeof Button

type UserInfoBoxProps = {
  user: UserDto
  reloadUserData: () => void
}

function UserInfoBox(props: UserInfoBoxProps) {
  const { user, reloadUserData } = props
  const { showSnackBarWithMessage, showSnackBarWithError } = useSnackbar()
  const { updateUserPicture } = useContext(AuthContext)

  const handleUploadProfilePicture = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (user) {
      try {
        const { files } = event.currentTarget
        const file = files?.[0]
        if (file && file.size > 5 * 1024 * 1024) {
          showSnackBarWithMessage('Image is too big (max 5MB)', 'warning')
        } else if (file) {
          const newUrl = await UsersService.uploadPicture({
            files: [file],
          })
          if (newUrl.length > 0) {
            // copy user and update picture
            const userNew = { ...user, picture: { url: newUrl[0].url } }
            await UsersService.updateUserById(user?.id, userNew)
            reloadUserData()
            updateUserPicture(userNew.picture)
            showSnackBarWithMessage('Profile picture updated', 'success')
          }
        }
      } catch (error) {
        showSnackBarWithError(error)
      }
    }
  }

  return (
    <Container component="main" maxWidth="sm" sx={{ mb: 1 }}>
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        <Grid container spacing={2}>
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              direction: 'column',
            }}
          >
            <Stack direction="column" spacing={2}>
              <LabeledOrPicturedAvatar
                sx={{ width: 100, height: 100 }}
                variant="rounded"
                userName={user?.name || '?'}
                userProfilePicUrl={user?.picture?.url}
              />
              <EditButton color="secondary" component="label">
                Upload Photo
                <input
                  type="file"
                  accept=".png, .jpg, .jpeg, .gif"
                  style={{ display: 'none' }}
                  onChange={handleUploadProfilePicture}
                />
              </EditButton>
            </Stack>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            md={8}
            sx={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Stack direction="column">
              <Typography mb={1} variant="h5">
                {user?.name}
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} md={7}>
                  <Typography variant="body2" fontWeight="bold">
                    Email:
                  </Typography>
                  <Typography sx={{ textOverflow: 'ellipsis' }} variant="body2">
                    {user?.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={5} sx={{ background: 'white' }}>
                  <Typography variant="body2" fontWeight="bold">
                    User Rating:
                  </Typography>
                  <Box display="flex" gap={1}>
                    <StarRateRounded sx={{ mt: '-3px' }} />
                    {displayRating(user.avgRating)}
                  </Box>
                </Grid>
                {user?.description && (
                  <Grid item xs={12}>
                    <Typography variant="body2" fontWeight="bold">
                      Description:
                    </Typography>
                    <Typography variant="body2">{user?.description}</Typography>
                  </Grid>
                )}
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default UserInfoBox
