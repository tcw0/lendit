import mongoose, { model, Document, Schema } from 'mongoose'
import {
  AggregatedRatingSchema,
  IAggregatedRatingDao,
} from './AggregatedRatingDao'
import { AvailabilitySchema, IAvailabilityDao } from './AvailabilityDao'
import { intValidator } from './validator'

export enum CategoryEnumDao {
  TOOLS = 'Tools',
  ELECTRONICS = 'Electronics',
  GARDEN = 'Garden',
  CLEANING = 'Cleaning',
  COOKING = 'Cooking',
  CLOTHING = 'Clothing',
  ACCESSORIES = 'Accessories',
  MUSIC = 'Music',
  OTHER = 'Other',
}

export interface IItemDao extends Document {
  title: string
  description: string
  priceFirstDay: number
  priceNextDays: number
  availability: IAvailabilityDao
  pictures: string[]
  avgRating: IAggregatedRatingDao
  insuranceReq: boolean
  categories: CategoryEnumDao[]
  lenderId: mongoose.Types.ObjectId
  featuredUntil?: Date
  addressId: mongoose.Types.ObjectId
  disabled?: boolean
}

const ItemSchema = new Schema<IItemDao>({
  title: { type: Schema.Types.String, required: true, index: true },
  description: { type: Schema.Types.String, required: true },
  priceFirstDay: {
    type: Schema.Types.Number,
    required: true,
    validate: intValidator,
  },
  priceNextDays: {
    type: Schema.Types.Number,
    required: true,
    validate: intValidator,
  },
  availability: { type: AvailabilitySchema, required: true },
  categories: {
    type: [Schema.Types.String],
    enum: Object.values(CategoryEnumDao),
    required: true,
  },
  pictures: { type: [Schema.Types.String], required: true },
  avgRating: { type: AggregatedRatingSchema, required: true },
  insuranceReq: { type: Schema.Types.Boolean, required: true },
  lenderId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  featuredUntil: { type: Date, required: false },
  addressId: { type: Schema.Types.ObjectId, required: true, ref: 'Address' },
  disabled: { type: Schema.Types.Boolean, required: false },
})

export const ItemDaoService = model<IItemDao>('Item', ItemSchema)
