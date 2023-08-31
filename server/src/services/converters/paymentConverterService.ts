import { PaymentDto, PaymentMethodDto } from '@api/generated'
import { IPaymentDao } from 'src/models/PaymentDao'
import { IPaymentMethodDao } from 'src/models/PaymentMethodDao'

/**
 * Converts a payment DAO to a payment DTO.
 * @param {IChatMessageDao} chatMessageDao the rental to convert.
 * @returns {RentalDto} the converted rental.
 */
export const convertPaymentDaoToDto = (paymentDao: IPaymentDao): PaymentDto => {
  return {
    id: paymentDao._id.toString(),
    rentalAmount: paymentDao.rentalAmount,
    insuranceAmount: paymentDao.insuranceAmount,
    paymentFromRenter: paymentDao.paymentFromRenter?.toISOString(),
    paymentToLender: paymentDao.paymentToLender?.toISOString(),
  } as PaymentDto
}

export default convertPaymentDaoToDto

/**
 * Convert IPaymentMethodDao to PaymentMethodDto.
 * @param {IPaymentMethodDao} paymentMethodDao The payment method DAO to convert.
 * @returns {PaymentMethodDto} The converted payment method DTO.
 */
export const convertPaymentMethodDaoToDto = (
  paymentMethodDao: IPaymentMethodDao,
): PaymentMethodDto => {
  const paymentMethodDto: PaymentMethodDto = {
    id: paymentMethodDao.id,
    creditCardOwner: paymentMethodDao.creditCardOwner,
    creditCardNumber: paymentMethodDao.creditCardNumber,
    creditCardExpiryDate: paymentMethodDao.creditCardExpiryDate.toISOString(),
    stripeId: paymentMethodDao.stripeId,
  }

  return paymentMethodDto
}
