import { model, Document, ObjectId, Schema } from 'mongoose'
import {
  AggregatedRatingSchema,
  IAggregatedRatingDao,
} from './AggregatedRatingDao'
import { emailValidator } from './validator'
import { IPaymentMethodDao, PaymentMethodSchema } from './PaymentMethodDao'

export enum UserStateEnumDao {
  ACTIVE = 'Active',
  NEVER_LOGGED_IN = 'NeverLoggedIn',
  NOT_VERIFIED = 'NotVerified',
}

export interface IUserDao extends Document {
  name: string
  email: string
  description?: string
  picture?: string
  registeredSince: Date
  avgRating: IAggregatedRatingDao
  addressIds: ObjectId[]
  password: string
  paymentMethods: IPaymentMethodDao[]
  userState?: UserStateEnumDao
  stripeCustomerId?: string
  disabled?: boolean
}

const UserSchema = new Schema<IUserDao>({
  name: { type: Schema.Types.String, required: true },
  email: {
    type: Schema.Types.String,
    required: true,
    unique: true,
    validate: emailValidator,
  },
  description: { type: Schema.Types.String, required: false },
  picture: { type: Schema.Types.String, required: false },
  registeredSince: { type: Schema.Types.Date, required: true },
  avgRating: {
    type: AggregatedRatingSchema,
    required: true,
  },
  addressIds: { type: [Schema.Types.ObjectId], required: true, ref: 'Address' },
  password: { type: Schema.Types.String, required: true },
  paymentMethods: {
    type: [PaymentMethodSchema],
    required: true,
    ref: 'PaymentMethod',
  },
  userState: {
    type: Schema.Types.String,
    enum: Object.values(UserStateEnumDao),
    required: false,
  },
  stripeCustomerId: { type: Schema.Types.String, required: false },
  disabled: { type: Schema.Types.Boolean, required: false },
})

export const UserDaoService = model<IUserDao>('User', UserSchema)
