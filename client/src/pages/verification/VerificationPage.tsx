import { UsersService } from '@api/services/UsersService'
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material'
import { CircularProgress, Paper, Stack, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Footer from 'src/components/Footer'
import { useSnackbar } from 'src/context/SnackbarContext'

export default function VerificationPage() {
  const [verifationLoading, setVerifiationLoading] =
    React.useState<boolean>(true)
  const [successVerification, setSuccessVerification] =
    React.useState<boolean>(false)

  const { userID, verificationID } = useParams()
  const { showSnackBarWithError } = useSnackbar()

  useEffect(() => {
    const verifyUser = async () => {
      if (userID && verificationID) {
        try {
          await UsersService.verifyUser(userID, verificationID)
          setSuccessVerification(true)
        } catch (error) {
          showSnackBarWithError(error)
          setSuccessVerification(false)
        } finally {
          setVerifiationLoading(false)
        }
      }
    }
    verifyUser()
  }, [userID, verificationID, showSnackBarWithError])

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          mt: '120px',
          mb: '20px',
          mx: '10%',
          display: 'flex',
          justifyContent: 'center',
          alignContent: 'center',
          height: '100px',
        }}
      >
        {verifationLoading ? (
          <CircularProgress />
        ) : (
          <Stack direction="row" alignItems="center" spacing={2}>
            {successVerification ? (
              <>
                <CheckCircleOutline color="secondary" />
                <Typography variant="h4">
                  Verified. You can now log into your account.
                </Typography>
              </>
            ) : (
              <>
                <ErrorOutline color="error" />
                <Typography variant="h4">Verification failed.</Typography>
              </>
            )}
          </Stack>
        )}
      </Paper>
      <Footer />
    </>
  )
}
