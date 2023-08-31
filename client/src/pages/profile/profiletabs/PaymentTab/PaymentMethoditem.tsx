import React, { useContext } from 'react'
import { Typography, Paper, Grid, IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import { PaymentMethodDto } from '@api/models/PaymentMethodDto'
import { UsersService } from '@api/services/UsersService'
import { AuthContext } from 'src/context/AuthContext'
import { useSnackbar } from 'src/context/SnackbarContext'

interface PaymentMethodItemProps {
  paymentMethod: PaymentMethodDto
  onDeletePaymentMethod: () => void
  handlePaymentMethodClick?: (payment: PaymentMethodDto) => void
}

function PaymentMethodItem(props: PaymentMethodItemProps): JSX.Element {
  const { paymentMethod, onDeletePaymentMethod, handlePaymentMethodClick } =
    props
  const { userId } = useContext(AuthContext)
  const { showSnackBarWithError, showSnackBarWithMessage } = useSnackbar()

  const handleDelete = async () => {
    if (userId) {
      try {
        await UsersService.deletePaymentMethod(userId, paymentMethod.id)
        onDeletePaymentMethod()
        showSnackBarWithMessage('Payment method deleted.', 'success')
      } catch (error) {
        showSnackBarWithError(error)
      }
    }
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
        '&:hover': handlePaymentMethodClick
          ? {
              cursor: 'pointer',
              transition: '.2s ease-in-out',
              transform: 'scale(1.03)',
            }
          : {},
      }}
      onClick={
        handlePaymentMethodClick
          ? () => handlePaymentMethodClick(paymentMethod)
          : undefined
      }
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <CreditCardIcon />
        </Grid>
        <Grid item sx={{ flexGrow: 1, marginRight: 2 }}>
          <Typography variant="body1">
            {paymentMethod.creditCardOwner}
          </Typography>
          <Typography variant="body2">
            Card Number: **** {paymentMethod.creditCardNumber}
          </Typography>
          <Typography variant="body2">
            Expiry Date:{' '}
            {new Date(paymentMethod.creditCardExpiryDate).toLocaleDateString(
              undefined,
              { month: '2-digit', year: 'numeric' },
            )}
          </Typography>
        </Grid>
        <Grid item>
          <IconButton onClick={handleDelete} color="primary">
            <DeleteIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Paper>
  )
}

PaymentMethodItem.defaultProps = {
  handlePaymentMethodClick: undefined,
}

export default PaymentMethodItem
