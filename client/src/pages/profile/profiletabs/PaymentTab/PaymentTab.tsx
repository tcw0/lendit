import React, { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Backdrop,
  CircularProgress,
} from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import CheckoutForm from 'src/components/Checkout'
import { PaymentDto } from '@api/models/PaymentDto'
import CloseButton from 'src/components/buttons/CloseButton'
import { AuthContext } from 'src/context/AuthContext'
import { UsersService } from '@api/services/UsersService'
import { useSnackbar } from 'src/context/SnackbarContext'
import { PaymentMethodDto } from '@api/models/PaymentMethodDto'
import PaymentMethodItem from 'src/pages/profile/profiletabs/PaymentTab/PaymentMethoditem'

type PaymentPageProps = {
  handlePaymentMethodClick?: (paymentMethod: PaymentMethodDto) => void
  handlePaymentMethodExisting?: (paymentMethodExisting: boolean) => void
  payment?: PaymentDto | undefined
  rentalId?: string | ''
  onSubmitClickProp?: () => void
  handleClose?: () => void
}

export default function PaymentPage(props: PaymentPageProps): JSX.Element {
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUB_KEY)
  const {
    handlePaymentMethodClick,
    onSubmitClickProp,
    handleClose,
    handlePaymentMethodExisting,
  } = props

  const { userId } = React.useContext(AuthContext)
  const { showSnackBarWithError } = useSnackbar()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDto[]>([])
  const [openDialog, setOpenDialog] = useState(false)

  const [isPaymentAdded, setIsPaymentAdded] = React.useState(false)

  const fetchPaymentMethods = useCallback(async () => {
    try {
      if (userId !== undefined) {
        const paymentMethodsData = await UsersService.getUserPaymentMethods(
          userId,
        )
        setPaymentMethods(paymentMethodsData)
        if (handlePaymentMethodExisting) {
          handlePaymentMethodExisting(paymentMethodsData.length > 0)
        }
      }
    } catch (error) {
      showSnackBarWithError(error)
    }
  }, [userId, showSnackBarWithError, handlePaymentMethodExisting])

  useEffect(() => {
    fetchPaymentMethods()
  }, [fetchPaymentMethods])

  const handleAddNewPaymentMethod = () => {
    setOpenDialog(true)
  }

  const handleDeletePaymentMethod = async () => {
    try {
      await fetchPaymentMethods()
    } catch (error) {
      showSnackBarWithError(error)
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const onSubmitClick = async () => {
    if (typeof onSubmitClickProp === 'function') {
      setOpenDialog(false)
      onSubmitClickProp()
    } else {
      const numMethods = paymentMethods.length
      setIsPaymentAdded(true)

      const fetchAndUpdate = async (elapsedTime = 0) => {
        await fetchPaymentMethods()

        // If a new payment method is detected, stop the interval and set isPaymentAdded to false
        if (paymentMethods && paymentMethods.length > numMethods) {
          setIsPaymentAdded(false)
        } else if (elapsedTime < 16000) {
          // If less than 16 seconds have passed, try again
          setTimeout(fetchAndUpdate, 2000, elapsedTime + 2000)
        } else {
          // After 16 seconds, stop trying to fetch new payment methods
          setIsPaymentAdded(false)
        }
      }

      fetchAndUpdate()
      setOpenDialog(false)
    }
  }

  const { payment, rentalId } = props

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
        p={2}
      >
        {handleClose && <CloseButton handleClose={handleClose} />}
        <Typography variant="h5">Payment Information</Typography>
        {paymentMethods.map(paymentMethod => (
          <PaymentMethodItem
            key={paymentMethod.id}
            paymentMethod={paymentMethod}
            onDeletePaymentMethod={handleDeletePaymentMethod}
            handlePaymentMethodClick={handlePaymentMethodClick}
          />
        ))}

        <Button
          variant="outlined"
          startIcon={<AddCircleIcon />}
          onClick={() => handleAddNewPaymentMethod()}
        >
          Add New Credit Card
        </Button>
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          PaperProps={{
            sx: {
              minWidth: 320,
            },
          }}
        >
          <DialogTitle>
            Add New Payment Method
            <CloseButton handleClose={handleCloseDialog} />
          </DialogTitle>
          <DialogContent>
            <Elements stripe={stripePromise}>
              <CheckoutForm
                payment={payment}
                rentalId={rentalId}
                onSubmitClick={onSubmitClick}
              />
            </Elements>
          </DialogContent>
        </Dialog>
      </Box>
      <Backdrop open={isPaymentAdded} sx={{ color: '#fff', zIndex: 9999 }}>
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
            Adding payment method, please wait...
          </Typography>
        </Box>
      </Backdrop>
    </>
  )
}

PaymentPage.defaultProps = {
  handlePaymentMethodClick: undefined,
  handlePaymentMethodExisting: undefined,
  payment: undefined,
  rentalId: '',
  onSubmitClickProp: undefined,
  handleClose: undefined,
}
