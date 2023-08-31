import { ValidateOpts } from 'mongoose'

/**
 * Mongoose validator for integer values
 */
export const intValidator: ValidateOpts<unknown> = {
  validator: Number.isInteger,
  message: '{VALUE} is not an integer value',
}

/**
 * Mongoose validator for credit card numbers
 */
export const creditCardNumberValidator: ValidateOpts<string> = {
  validator: (value: string): boolean => {
    const strippedValue = value.replace(/[\s-]/g, '')

    // Check if the value consists of 16 digits
    if (!/^\d{16}$/.test(strippedValue)) {
      return false
    }

    // Check the card number using the Luhn algorithm
    let sum = 0
    let shouldDouble = false
    for (let i = strippedValue.length - 1; i >= 0; i -= 1) {
      let digit = parseInt(strippedValue.charAt(i), 10)
      if (shouldDouble) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }
      sum += digit
      shouldDouble = !shouldDouble
    }

    return sum % 10 === 0
  },
  message: '{VALUE} is not a valid credit card number',
}

/**
 * Mongoose validator for credit card expiration dates
 */
export const creditCardCVCValidator: ValidateOpts<string> = {
  validator: (value: string): boolean => {
    const strippedValue = value.replace(/[\s-]/g, '')

    // Check if the value consists of 3 or 4 digits
    return /^\d{3,4}$/.test(strippedValue)
  },
  message: '{VALUE} is not a valid credit card CVC',
}

/**
 * Mongoose validator for email addresses
 */
export const emailValidator: ValidateOpts<string> = {
  validator: (value: string): boolean => {
    // Check if the value is a valid email address
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  },
  message: '{VALUE} is not a valid email address',
}

/**
 * Mongoose validator for latitude values (geo)
 */
export const latitudeValidator: ValidateOpts<number> = {
  validator: (value: number): boolean => {
    return value >= -90 && value <= 90
  },
  message: '{VALUE} is not a valid latitude',
}

/**
 * Mongoose validator for longitude values (geo)
 */
export const longitudeValidator: ValidateOpts<number> = {
  validator: (value: number): boolean => {
    return value >= -180 && value <= 180
  },
  message: '{VALUE} is not a valid longitude',
}
