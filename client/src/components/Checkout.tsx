/* eslint-disable */
import React, { FormEvent, useState } from 'react'
import {
  useStripe,
  useElements,
  CardNumberElement,
} from '@stripe/react-stripe-js'

import { PaymentMethodResult } from '@stripe/stripe-js'
import { Button } from '@mui/material'
import { SnackbarContext } from 'src/context/SnackbarContext'
import { PaymentDto } from '@api/models/PaymentDto'
import { UsersService } from '@api/services/UsersService'
import { AuthContext } from 'src/context/AuthContext'
import CardSection from './PaymentCard'

const handleServerResponse = async (response: {
  error?: any
  clientSecret?: any
  requiresAction?: any
}, paymentMethodId: string, payment: PaymentDto,  userId: string,) => {
  const stripe = useStripe()
  if (stripe) {
    if (response.error) {
      // Show error from server on payment form
    } else if (response.requiresAction) {
      // Use Stripe.js to handle the required card action
      const { error: errorAction, paymentIntent } =
        await stripe.handleCardAction(response.clientSecret)

      if (errorAction) {
        // Show error from Stripe.js in payment form
      } else {
        // The card action has been handled
        // The PaymentIntent can be confirmed again on the server
        const serverResponse = UsersService.createStripePayment(userId, paymentMethodId, {payment: payment})

        handleServerResponse(await serverResponse, paymentMethodId, payment,userId)
      }
    } else {
      // Success
    }
  }
}

const stripeNewPaymentMethodHandler = async (
  result: PaymentMethodResult,
  snackbarContext: any,
  userId: string,
) => {
  if (result.error) {
    snackbarContext.showSnackBarWithError(result.error)
  } else if (userId) {
    const paymentResponse = await UsersService.createStripePayment(
      userId,
      result.paymentMethod.id,
      {},
    )
  }
}

export const stripeRentalPaymentMethodHandler = async (
  paymentMethodId: string,
  payment: PaymentDto,
  userId: string,
  saveCard: boolean,
  rentalID?: string,
) => {
  if (userId) {
    const paymentResponse = await UsersService.createStripePayment(
      userId,
      paymentMethodId,
      { payment, savePaymentMethod: saveCard, rentalID },
    )

    // Handle server response
    handleServerResponse(paymentResponse, paymentMethodId, payment, userId)
  }
}

export default function CheckoutForm({
  payment,
  rentalId,
  onSubmitClick,
}: {
  payment?: PaymentDto | undefined
  rentalId?: string
  onSubmitClick?: () => void
}) {
  const snackbarContext = React.useContext(SnackbarContext)
  const { userId } = React.useContext(AuthContext)
  const stripe = useStripe()
  const elements = useElements()
  const [saveCard, setSaveCard] = useState(false) // Added this line

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    const cardElement = elements.getElement(CardNumberElement)
    if (cardElement) {
      if (onSubmitClick) {
        // Notify the parent component about the submision of the payment event
        onSubmitClick()
      }

      const result = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: 'Jenny Rosen',
        },
      })

      if (
        rentalId !== undefined &&
        payment !== undefined &&
        userId &&
        result.paymentMethod
      ) {
        stripeRentalPaymentMethodHandler(
          result.paymentMethod?.id,
          payment,
          userId,
          saveCard,
          rentalId,
        )
      } else {
        stripeNewPaymentMethodHandler(result, snackbarContext, userId || '')
      }
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} style={{ padding: '10px' }}>
        <CardSection />
        {payment && (
          <div style={{ margin: '10px 0' }}>
            <label>
              <input
                type="checkbox"
                checked={saveCard}
                onChange={e => setSaveCard(e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              Save card for future use
            </label>
          </div>
        )}
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          disabled={!stripe}
          style={{ marginTop: '10px' }}
        >
          {payment ? 'Submit Payment' : 'Save Payment'}
        </Button>
      </form>
    </>
  )
}
