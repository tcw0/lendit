import { model, Document, ObjectId, Schema } from 'mongoose'
import { ChatMessageSchema, IChatMessageDao } from './ChatMessageDao'
import { IPaymentDao, PaymentSchema } from './PaymentDao'
import { HandoverSchema, IHandoverDao } from './HandoverDao'

export enum RentalStateEnumDao {
  OFFER = 'Offer',
  ACCEPTED = 'Accepted',
  DECLINED = 'Declined',
  PAID = 'Paid',
  PICKED_UP = 'PickedUp',
  PICK_UP_CONFIRMED = 'PickUpConfirmed',
  RETURNED = 'Returned',
  RETURN_CONFIRMED = 'ReturnConfirmed',
  RATED = 'Rated',
  CLOSED = 'Closed',
}

export enum InsuranceTypeEnumDao {
  NONE = 'None',
  BASIC = 'Basic',
  PREMIUM = 'Premium',
}

export interface IRentalDao extends Document {
  startRental: Date
  endRental: Date
  payment: IPaymentDao
  itemId: ObjectId
  insuranceType: InsuranceTypeEnumDao
  renterId: ObjectId
  lenderId: ObjectId
  rentalState: RentalStateEnumDao
  returnHandover?: IHandoverDao
  pickUpHandover?: IHandoverDao
  messages: IChatMessageDao[]
  renterRatingId?: ObjectId
  lenderRatingId?: ObjectId
  itemRatingId?: ObjectId
}

const RentalSchema = new Schema<IRentalDao>({
  startRental: { type: Schema.Types.Date, required: true },
  endRental: { type: Schema.Types.Date, required: true },
  payment: { type: PaymentSchema, required: true },
  itemId: { type: Schema.Types.ObjectId, required: true, ref: 'Item' },
  insuranceType: {
    type: Schema.Types.String,
    enum: Object.values(InsuranceTypeEnumDao),
    required: true,
  },
  renterId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  lenderId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  rentalState: {
    type: Schema.Types.String,
    enum: Object.values(RentalStateEnumDao),
    required: true,
  },
  returnHandover: {
    type: HandoverSchema,
    required: false,
  },
  pickUpHandover: {
    type: HandoverSchema,
    required: false,
  },
  messages: {
    type: [ChatMessageSchema],
    required: true,
  },
  renterRatingId: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'UserRating',
  },
  lenderRatingId: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'UserRating',
  },
  itemRatingId: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'ItemRating',
  },
})

export const RentalDaoService = model<IRentalDao>('Rental', RentalSchema)

export enum RentalRole {
  RENTER = 'Renter',
  LENDER = 'Lender',
}
