import { PaymentDto } from '@api/models/PaymentDto'
import { InsuranceTypeEnum } from '@api/models/InsuranceTypeEnum'
import { PaymentMethodDto } from '@api/models/PaymentMethodDto'
import { RentalDto } from '@api/models/RentalDto'
import { RentalRoleEnum } from '@api/models/RentalRoleEnum'
import { RentalStateEnum } from '@api/models/RentalStateEnum'
import { RentalsService } from '@api/services/RentalsService'
import { CheckCircle, HourglassTop, Payment } from '@mui/icons-material'
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  Stack,
  StepContent,
  StepLabel,
  Typography,
} from '@mui/material'
import React from 'react'
import { AuthContext } from 'src/context/AuthContext'
import { useSnackbar } from 'src/context/SnackbarContext'
import { stripeRentalPaymentMethodHandler } from 'src/components/Checkout'
import { intToPrice } from 'src/helper/helper'
import PaymentTab from 'src/pages/profile/profiletabs/paymentTab/PaymentTab'

type PaymentStepProps = {
  rental?: RentalDto
  setRental: (rental: RentalDto) => void
  role: RentalRoleEnum
}

export default function PaymentStep(props: PaymentStepProps): JSX.Element {
  const { userId } = React.useContext(AuthContext)
  const { rental, setRental, role } = props
  const [openPayDialog, setOpenPayDialog] = React.useState(false)
  const [isPaymentProcessing, setIsPaymentProcessing] = React.useState(false)

  const { showSnackBarWithError, showSnackBarWithMessage } = useSnackbar()

  const handlePayButton = () => {
    setOpenPayDialog(true)
  }

  const handlePay = async (paymentMethod: PaymentMethodDto) => {
    if (rental) {
      setIsPaymentProcessing(true)
      try {
        const paymentTest: PaymentDto = {
          id: paymentMethod.id,
          rentalAmount: rental.price,
          insuranceAmount: rental.insurancePrice,
        }

        await stripeRentalPaymentMethodHandler(
          paymentMethod.stripeId,
          paymentTest,
          userId || '',
          true,
          rental?.id,
        )

        const newRental = await RentalsService.getRentalById(rental?.id)

        setRental(newRental)
        setIsPaymentProcessing(false)
        showSnackBarWithMessage('Payment succesful', 'success')
        setOpenPayDialog(false)
      } catch (error) {
        setIsPaymentProcessing(false)
        showSnackBarWithError(error)
      }
    }
  }

  const paymentToHappen = () => {
    return (
      rental?.rentalState === RentalStateEnum.ACCEPTED ||
      rental?.rentalState === RentalStateEnum.OFFER ||
      rental?.rentalState === RentalStateEnum.DECLINED
    )
  }

  const onSubmitClick = () => {
    setIsPaymentProcessing(true)
    // total attempts to check the rental status
    const totalAttempts = 8
    let attempts = 0

    const checkRentalStatus = async () => {
      attempts += 1
      // Fetch new data
      const newRental = await RentalsService.getRentalById(rental?.id || '')
      // If rental state is 'PAID', show success message
      if (newRental?.rentalState === RentalStateEnum.PAID) {
        showSnackBarWithMessage('Payment succesful', 'success')
        setIsPaymentProcessing(false)
        setOpenPayDialog(false)
        setRental(newRental)
      } else if (attempts < totalAttempts) {
        // if rental is not paid and we haven't exceeded total attempts, try again
        setTimeout(checkRentalStatus, 2000) // check status again in 2 seconds
      } else {
        // if rental is still not paid after all attempts, show an error
        showSnackBarWithMessage('Payment unsuccessful', 'error')
        setIsPaymentProcessing(false)
      }
    }

    // Start checking rental status
    setTimeout(checkRentalStatus, 2000)
  }

  return (
    <>
      <StepLabel>
        <Typography fontWeight={600} variant="subtitle1">
          Payment
        </Typography>
      </StepLabel>
      <StepContent>
        <Typography variant="body2">
          Rental price: {rental && intToPrice(rental.price)}€
        </Typography>
        {(rental?.insuranceType === InsuranceTypeEnum.BASIC ||
          rental?.insuranceType === InsuranceTypeEnum.PREMIUM) && (
          <>
            <Typography variant="body2">
              Insurance price: {rental && intToPrice(rental.insurancePrice)}
            </Typography>
            <Typography variant="body2">
              Total price:{' '}
              {rental && intToPrice(rental.insurancePrice + rental.price)}
            </Typography>
          </>
        )}
        {paymentToHappen() && (
          <Button
            variant="contained"
            startIcon={<Payment />}
            onClick={handlePayButton}
            disabled={
              rental?.rentalState !== RentalStateEnum.ACCEPTED ||
              role !== RentalRoleEnum.RENTER
            }
            sx={{ mt: 1 }}
          >
            <Typography>Pay</Typography>
          </Button>
        )}
        <Stack direction="row" spacing={1} pt={1}>
          {paymentToHappen() ? (
            <>
              <HourglassTop />
              <Typography variant="body2">Waiting for payment.</Typography>
            </>
          ) : (
            <>
              <CheckCircle />
              <Typography variant="body2">Rental is paid.</Typography>
            </>
          )}
        </Stack>
      </StepContent>
      <Dialog open={openPayDialog}>
        <PaymentTab
          handlePaymentMethodClick={handlePay}
          payment={{
            id: '',
            rentalAmount: rental?.price || 0,
            insuranceAmount: rental?.insurancePrice || 0,
          }}
          rentalId={rental?.id || ''}
          onSubmitClickProp={onSubmitClick}
        />

        <Backdrop
          open={isPaymentProcessing}
          sx={{ color: '#fff', zIndex: 9999 }}
        >
          <Box
            position="absolute"
            top="50%"
            left="50%"
            style={{
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <CircularProgress />
            <Typography
              variant="h6"
              component="div"
              style={{ marginTop: '20px' }}
            >
              Processing payment via Stripe, please wait...
            </Typography>
          </Box>
        </Backdrop>
      </Dialog>
    </>
  )
}

PaymentStep.defaultProps = {
  rental: undefined,
}
