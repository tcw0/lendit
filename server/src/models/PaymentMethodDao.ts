import mongoose, { Schema, Document } from 'mongoose'

export interface IPaymentMethodDao extends Document {
  creditCardNumber: string
  creditCardOwner: string
  creditCardExpiryDate: Date
  stripeId: string
}

export const PaymentMethodSchema = new Schema<IPaymentMethodDao>({
  creditCardNumber: {
    type: String,
    required: true,
  },
  creditCardOwner: {
    type: String,
    required: true,
  },
  creditCardExpiryDate: {
    type: Date,
    required: true,
  },
  stripeId: {
    type: String,
    required: true,
  },
})

export const PaymentMethodDao = mongoose.model<IPaymentMethodDao>(
  'PaymentMethod',
  PaymentMethodSchema,
)
