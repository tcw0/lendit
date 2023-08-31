import * as React from 'react'

// mui components
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Link,
  Box,
  Typography,
  LinearProgress,
  Button,
  TextField,
} from '@mui/material'

import { linearProgressClasses } from '@mui/material/LinearProgress'

import { styled } from '@mui/system'
import PaymentTab from 'src/pages/profile/profiletabs/paymentTab/PaymentTab'
import lenditLogo from 'src/assets/lenditLogo.png'
import { UsersService } from '@api/services/UsersService'
import { AuthContext } from 'src/context/AuthContext'
import { SnackbarContext } from 'src/context/SnackbarContext'
import { UserDto } from '@api/models/UserDto'

// references
import CloseButton from '../buttons/CloseButton'
import UploadSuggestions from './UploadSuggestions'

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

const EditButton = styled(Button)(({ theme }) => ({
  textTransform: 'capitalize',
  color: theme.palette.secondary.main,
  fontWeight: 'bold',
  textAlign: 'center',
})) as typeof Button

export default function CompleteProfile({
  openCompleteProfile,
  setOpenCompleteProfile,
}: {
  openCompleteProfile: boolean
  setOpenCompleteProfile: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const maxProgress = 7
  const [progress, setProgress] = React.useState(4)
  const maxSteps = 3
  const [activeStep, setActiveStep] = React.useState(0)

  const [user, setUser] = React.useState<UserDto>()
  const [profilePicture, setProfilePicture] = React.useState<File>()
  const [description, setDescription] = React.useState<string>('')
  const [hasPaymentMethod, setHasPaymentMethod] = React.useState<boolean>(false)
  const { showSnackBarWithError, showSnackBarWithMessage } =
    React.useContext(SnackbarContext)
  const { userId, updateUserPicture } = React.useContext(AuthContext)

  const handleClose = () => {
    setOpenCompleteProfile(false)
  }

  const increaseProgress = () => {
    setProgress(prevProgress =>
      prevProgress >= maxProgress ? maxProgress : prevProgress + 1,
    )
  }

  const decreaseProgress = () => {
    setProgress(prevProgress => (prevProgress <= 0 ? 0 : prevProgress - 1))
  }

  const handleNext = () => {
    setActiveStep(activeStep + 1)
  }

  const handleBack = () => {
    setActiveStep(activeStep - 1)
  }

  const handlePaymentMethodExisting = (paymentMethodExisting: boolean) => {
    if (paymentMethodExisting && !hasPaymentMethod) {
      setHasPaymentMethod(true)
      increaseProgress()
    } else if (!paymentMethodExisting && hasPaymentMethod) {
      setHasPaymentMethod(false)
      decreaseProgress()
    }
  }

  React.useEffect(() => {
    const fetchUser = async () => {
      if (userId !== undefined) {
        try {
          const user: UserDto = await UsersService.getUserById(userId)
          setUser(user)
        } catch (error) {
          showSnackBarWithError(error)
        }
      }
    }

    if (openCompleteProfile) {
      fetchUser()
    }
  }, [openCompleteProfile, userId, showSnackBarWithError])

  function getStepContent(step: number) {
    // get step content based on step number (profile completion step)
    switch (step) {
      case 0:
        return (
          <>
            <Typography variant="h5">Profile Picture</Typography>
            <Box
              component="img"
              src={
                profilePicture
                  ? URL.createObjectURL(profilePicture)
                  : lenditLogo
              }
              sx={{
                objectFit: 'cover',
                height: 100,
                width: 100,
                borderRadius: '8px',
                boxShadow: 5,
                my: 2,
              }}
            />
            <EditButton color="secondary" component="label">
              Upload Photo
              <input
                type="file"
                accept=".png, .jpg, .jpeg, .gif"
                style={{ display: 'none' }}
                onChange={event => {
                  const file = event.target.files?.[0]
                  if (file) {
                    if (file.size < 5 * 1024 * 1024) {
                      if (!profilePicture && file) {
                        increaseProgress()
                      }
                      setProfilePicture(file)
                    } else {
                      showSnackBarWithMessage(
                        'Please upload a smaller image (max 5MB)',
                        'warning',
                      )
                    }
                  }
                }}
              />
            </EditButton>
            <Typography variant="h5">Tell us about yourself</Typography>
            <TextField
              type="text"
              id="description"
              name="description"
              label="Description"
              fullWidth
              multiline
              minRows={5}
              maxRows={10}
              size="small"
              margin="dense"
              value={description}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                if (!description && event.target.value) {
                  increaseProgress()
                }

                if (description && !event.target.value) {
                  decreaseProgress()
                }

                setDescription(event.target.value)
              }}
            />
          </>
        )
      case 1:
        return (
          <PaymentTab
            handlePaymentMethodExisting={handlePaymentMethodExisting}
          />
        )
      case 2:
        return <UploadSuggestions />
      default:
        throw new Error('Unknown step')
    }
  }

  const handleComplete = async () => {
    if (user) {
      try {
        if (profilePicture) {
          const newUrl = await UsersService.uploadPicture({
            files: [profilePicture],
          })
          if (newUrl.length > 0) {
            user.picture = { url: newUrl[0].url as string }
            updateUserPicture(user.picture)
          }
        }
        if (description) {
          user.description = description
        }
        UsersService.updateUserById(user.id, user)
        handleClose()
        // showSnackBarWithMessage('Profile completed', 'success')
      } catch (error) {
        showSnackBarWithError(error)
      }
    }
  }

  return (
    <Dialog
      maxWidth="sm"
      open={openCompleteProfile}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: 900,
        },
      }}
    >
      <DialogTitle>
        <Typography fontWeight="bold" align="center">
          Complete Your Profile
        </Typography>
        <CloseButton handleClose={handleClose} />
      </DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ width: '100%', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(progress / maxProgress) * 100}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    [`&.${linearProgressClasses.colorPrimary}`]: {
                      backgroundColor: '#eeeeee',
                    },
                    [`& .${linearProgressClasses.bar}`]: {
                      borderRadius: 5,
                      backgroundColor: 'secondary.main',
                    },
                  }}
                />
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  color="primary.main"
                >{`${progress}/${maxProgress}`}</Typography>
              </Box>
            </Box>
          </Box>

          {getStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          {activeStep !== 0 && (
            <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
              Back
            </Button>
          )}

          {activeStep !== maxSteps - 1 && (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{ mt: 3, ml: 1 }}
            >
              Next
            </Button>
          )}

          {activeStep === maxSteps - 1 && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleComplete}
              sx={{ mt: 3, ml: 1, fontWeight: 'bold' }}
            >
              Complete
            </Button>
          )}
        </Box>

        <Copyright />
      </DialogContent>
    </Dialog>
  )
}
