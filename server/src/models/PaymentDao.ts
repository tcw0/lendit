import { Schema, Document } from 'mongoose'
import { intValidator } from './validator'

export interface IPaymentDao extends Document {
  rentalAmount: number
  insuranceAmount: number
  paymentFromRenter?: Date
  paymentToLender?: Date
}

export const PaymentSchema = new Schema<IPaymentDao>({
  rentalAmount: {
    type: Schema.Types.Number,
    required: true,
    validate: intValidator,
  },
  insuranceAmount: {
    type: Schema.Types.Number,
    required: true,
    validate: intValidator,
  },
  paymentFromRenter: { type: Schema.Types.Date, required: false },
  paymentToLender: { type: Schema.Types.Date, required: false },
})
