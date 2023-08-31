import Stripe from 'stripe'
import mongoose from 'mongoose'
import { ApiError, ApiErrorCodes } from 'src/middleware/errorhandler/APIError'
import { IPaymentDao } from 'src/models/PaymentDao'
import {
  IPaymentMethodDao,
  PaymentMethodDao,
} from 'src/models/PaymentMethodDao'
import { RentalRole } from 'src/models/RentalDao'
import { IUserDao } from 'src/models/UserDao'
import {
  NewPaymentMethodDto,
  PaymentDto,
  PaymentMethodDto,
} from '@api/generated'
import logger from 'src/middleware/logger/logger'
import { addUserPaymentMethod, getUserByUserId } from './userService'
import env from '../config/env'
import {
  getRentalWithAccessCheckAndRole,
  updateRentalStateAfterAction,
} from './rentalService'
import { createNewSystemMessageForRental } from './chatMessageService'
import { prepareAndSendInsuranceMail } from './mailService'

/**
 * Mark a payment as paid by the user with the given role.
 * @param {IPaymentDao} payment the payment to convert.
 * @param {RentalRole} role the role of the user requesting the change.
 * @returns {Promise<IPaymentDao>} the updated payment.
 */
export const markPaymentAsPaidByPaymentIdForRole = async (
  payment: IPaymentDao,
  role: RentalRole,
): Promise<IPaymentDao> => {
  if (role === RentalRole.LENDER) {
    // eslint-disable-next-line no-param-reassign
    payment.paymentToLender = new Date()
  } else if (role === RentalRole.RENTER) {
    // eslint-disable-next-line no-param-reassign
    payment.paymentFromRenter = new Date()
  }

  return payment.save()
}

/**
 * Returns the payment method with the given id if it exists and belongs to the user with the given id.
 * @param {ObjectId} paymentId the id of the payment method.
 * @param {ObjectId} userId the id of the user to whom the payment method belongs.
 * @throws {ApiError} if the payment method does not exist or does not belong to the user.
 * @returns {Promise<IPaymentMethodDao>} the payment method with the given id.
 */
export const getPaymentByIdAndUserId = async (
  paymentId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
): Promise<IPaymentMethodDao> => {
  const payment = await PaymentMethodDao.findById(paymentId)
  if (!payment) {
    throw new ApiError(
      ApiErrorCodes.NOT_FOUND,
      `Payment with ${paymentId.toString()} not found.`,
    )
  }
  const user: IUserDao = await getUserByUserId(userId)
  if (
    !user.paymentMethods
      .map(pM => pM._id.toString())
      .includes(payment._id.toString())
  ) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `Payment with ${paymentId.toString()} does not belong to user ${userId}.`,
    )
  }
  return payment
}

export const updatePaymentMethodByIdAndUser = async (
  paymentId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  toUpdatePayment: PaymentMethodDto,
): Promise<IPaymentMethodDao> => {
  const payment: IPaymentMethodDao = await getPaymentByIdAndUserId(
    paymentId,
    userId,
  )
  payment.creditCardOwner = toUpdatePayment.creditCardOwner
  payment.creditCardNumber = toUpdatePayment.creditCardNumber
  payment.creditCardExpiryDate = new Date(toUpdatePayment.creditCardExpiryDate)
  payment.stripeId = toUpdatePayment.stripeId
  return payment.save()
}

/**
 * Pay the given amount with the payment method with the given id if it exists and belongs to the user with the given id.
 * @param {ObjectId} paymentId the id of the payment method.
 * @param {ObjectId} userId the id of the user to whom the payment method belongs.
 * @param {number} amount the amount to pay.
 */
export const payWithPaymentByIdAndUserIdAndAmount = async (
  paymentId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  amount: number,
): Promise<void> => {
  const payment: IPaymentMethodDao = await getPaymentByIdAndUserId(
    paymentId,
    userId,
  )

  logger.silly(`Paying ${amount} with payment ${payment._id.toString()}.`)
  // TODO call sth like stripe
}

/**
 * Create a stripe payment method for a user.
 * @param {PaymentMethodDto} paymentMethod The payment method details.
 * @param {UserDto} user The user details.
 * @returns {Promise<string>} The client secret of the payment intent.
 */
export const createStripePaymentMethodForUser = async (
  paymentMethodId: string,
  userId: mongoose.Types.ObjectId,
): Promise<string> => {
  // eslint-disable-next-line
  const stripeInstance = new Stripe(env.STRIPE_SECRET_KEY ?? '', {
    apiVersion: '2022-11-15',
  })

  const user: IUserDao | null = await getUserByUserId(userId)

  let customer: Stripe.Customer

  if (user?.stripeCustomerId) {
    // Retrieve existing customer
    customer = (await stripeInstance.customers.retrieve(
      user.stripeCustomerId,
    )) as Stripe.Customer
  } else {
    // Create a new Customer
    const params: Stripe.CustomerCreateParams = {
      description: `Customer for user_id ${userId}`,
    }
    customer = await stripeInstance.customers.create(params)

    // save stripe customer id in the user
    user?.set({ stripeCustomerId: customer.id })
    await user?.save()
  }

  const paymentMethods = await stripeInstance.paymentMethods.list({
    customer: customer.id,
    type: 'card',
  })

  const paymentMethodExists = paymentMethods.data.some(
    paymentMethod => paymentMethod.id === paymentMethodId,
  )

  // Add payment method to mongodb if not already saved
  if (paymentMethodExists) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `Payment method already exists for user ${userId}.`,
    )
  }
  const paymentMethod = await stripeInstance.paymentMethods.retrieve(
    paymentMethodId,
  )

  // Attach the PaymentMethod to the Customer
  await stripeInstance.paymentMethods.attach(paymentMethodId, {
    customer: customer.id,
  })

  let date = ''
  date += paymentMethod.card?.exp_month || ''
  date += '.01.'
  date += paymentMethod.card?.exp_year || ''

  const name = user?.name || ''
  const last4 = paymentMethod.card?.last4 || ''

  const paymentMethodData: NewPaymentMethodDto = {
    creditCardOwner: name,
    creditCardNumber: last4,
    creditCardExpiryDate: date,
    stripeId: paymentMethodId,
  }
  addUserPaymentMethod(userId, paymentMethodData)

  return 'Payment method created'
}

/**
 * Create a payment intent for a user.
 * @param {PaymentMethodDto} paymentMethod The payment method details.
 * @param {UserDto} user The user details.
 * @returns {Promise<string>} The client secret of the payment intent.
 */
export const createPaymentIntentForUser = async (
  paymentMethodId: string,
  userId: mongoose.Types.ObjectId,
  payment: PaymentDto,
  saveCard: boolean,
  rentalId?: mongoose.Types.ObjectId,
): Promise<string> => {
  try {
    const user: IUserDao | null = await getUserByUserId(userId)

    if (payment.paymentFromRenter) {
      throw new ApiError(
        ApiErrorCodes.BAD_REQUEST,
        `Payment from Renter ${payment.id} already recorded`,
      )
    }

    // eslint-disable-next-line
    const stripeInstance = new Stripe(env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2022-11-15',
    })

    let paymentIntent: Stripe.PaymentIntent
    const totalAmount =
      (payment.rentalAmount || 0) + (payment.insuranceAmount || 0)

    if (saveCard) {
      let customer: Stripe.Customer

      if (user?.stripeCustomerId) {
        // Retrieve existing customer
        customer = (await stripeInstance.customers.retrieve(
          user.stripeCustomerId,
        )) as Stripe.Customer
      } else {
        // Create a new Customer
        const params: Stripe.CustomerCreateParams = {
          description: `Customer for user_id ${userId}`,
        }

        customer = await stripeInstance.customers.create(params)

        // save stripe customer id in the user
        user?.set({ stripeCustomerId: customer.id })
        await user?.save()
      }

      const paymentMethods = await stripeInstance.paymentMethods.list({
        customer: customer.id,
        type: 'card',
      })

      const paymentMethodExists = paymentMethods.data.some(
        paymentMethod => paymentMethod.id === paymentMethodId,
      )

      // Attach the PaymentMethod to the Customer
      await stripeInstance.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      })

      // Add payment method to mongodb if not already saved
      if (!paymentMethodExists) {
        const paymentMethod = await stripeInstance.paymentMethods.retrieve(
          paymentMethodId,
        )

        let date = ''
        date += paymentMethod.card?.exp_month || ''
        date += '.01.'
        date += paymentMethod.card?.exp_year || ''

        const name = user?.name || ''
        const last4 = paymentMethod.card?.last4 || ''

        const paymentMethodData: NewPaymentMethodDto = {
          creditCardOwner: name,
          creditCardNumber: last4,
          creditCardExpiryDate: date,
          stripeId: paymentMethodId,
        }
        addUserPaymentMethod(userId, paymentMethodData)
      }

      paymentIntent = await stripeInstance.paymentIntents.create({
        amount: totalAmount, // Replace with the actual amount in cents (e.g., $10.00)
        currency: 'eur', // Replace with the desired currency code
        payment_method: paymentMethodId,
        description: `Payment with id: ${payment.id} by user with id: ${userId}`,
        confirm: true, // Set to true to immediately confirm the PaymentIntent
        customer: customer.id,
        metadata: {
          userId: userId.toString(),
        },
      })
    } else {
      // Create a PaymentIntent with the desired amount and currency
      paymentIntent = await stripeInstance.paymentIntents.create({
        amount: totalAmount, // Replace with the actual amount in cents (e.g., $10.00)
        currency: 'eur', // Replace with the desired currency code
        payment_method: paymentMethodId,
        description: `Payment with id: ${payment.id} by user with id: ${userId}`,
        confirm: true, // Set to true to immediately confirm the PaymentIntent
        metadata: {
          userId: userId.toString(),
        },
      })
    }

    if (paymentIntent.status === 'requires_action') {
      // Tell the client to handle the action
      return 'Action required'
    }
    if (paymentIntent.status === 'succeeded') {
      if (rentalId) {
        const { rentalDao } = await getRentalWithAccessCheckAndRole(
          rentalId,
          userId,
        )
        if (user) {
          rentalDao.payment.paymentFromRenter = new Date()
          await rentalDao.save()
          await prepareAndSendInsuranceMail(rentalDao)
          await createNewSystemMessageForRental(
            'Rental was paid.',
            user.id,
            rentalDao,
          )
          await updateRentalStateAfterAction(rentalId)
        }
      }
      // The payment didn’t need any additional actions and completed
      return 'Success'
    }
    // Invalid status
    return 'Invalid Payment Intent'
  } catch (error) {
    logger.error('Error creating payment intent:', error)
    throw new ApiError(
      ApiErrorCodes.INTERNAL_SERVER_ERROR,
      'Error creating payment intent',
    )
  }
}
