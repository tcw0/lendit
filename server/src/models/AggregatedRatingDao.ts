import { Document, Schema } from 'mongoose'
import { intValidator } from './validator'

export interface IAggregatedRatingDao extends Document {
  averageRating: number
  count: number
}

export const AggregatedRatingSchema = new Schema<IAggregatedRatingDao>({
  averageRating: { type: Schema.Types.Number, required: true },
  count: { type: Schema.Types.Number, required: true, validate: intValidator },
})
