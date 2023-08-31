import { Schema, Document, model, ObjectId } from 'mongoose'
import { intValidator } from './validator'

export interface IItemRatingDao extends Document {
  ratedItemId: ObjectId
  stars: number
  text: string
  time: Date
  authorId: ObjectId
}

const ItemRatingSchema = new Schema<IItemRatingDao>({
  ratedItemId: { type: Schema.Types.ObjectId, required: true, ref: 'Item' },
  stars: { type: Schema.Types.Number, required: true, validate: intValidator },
  text: { type: Schema.Types.String, required: true },
  time: { type: Schema.Types.Date, required: true },
  authorId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
})

export const ItemRatingDaoService = model<IItemRatingDao>(
  'ItemRating',
  ItemRatingSchema,
)
