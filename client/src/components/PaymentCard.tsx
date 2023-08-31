import React from 'react'
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@stripe/react-stripe-js'

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '20px',
      '::placeholder': {
        color: '#aab7c4',
      },
      border: '1px solid #ccc', // Add a border to your input fields
      borderRadius: '4px', // Add rounded corners if you want
      padding: '10px', // Add some padding
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
}

function CardSection() {
  return (
    <div style={{ margin: '0 auto', maxWidth: '400px', padding: '10px' }}>
      <fieldset style={{ border: 'none', margin: '0', padding: '0' }}>
        <legend>Card Number</legend>
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px',
          }}
        >
          <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </fieldset>
      <fieldset style={{ border: 'none', margin: '0', padding: '0' }}>
        <legend>Expiration Date</legend>
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px',
          }}
        >
          <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </fieldset>
      <fieldset style={{ border: 'none', margin: '0', padding: '0' }}>
        <legend>CVC</legend>
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px',
          }}
        >
          <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </fieldset>
    </div>
  )
}

export default CardSection
