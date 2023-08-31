import { Schema, Document, model, ObjectId } from 'mongoose'
import { intValidator } from './validator'

export interface IUserRatingDao extends Document {
  ratedUserId: ObjectId
  stars: number
  text: string
  time: Date
  authorId: ObjectId
}

const UserRatingSchema = new Schema<IUserRatingDao>({
  ratedUserId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  stars: { type: Schema.Types.Number, required: true, validate: intValidator },
  text: { type: Schema.Types.String, required: true },
  time: { type: Schema.Types.Date, required: true },
  authorId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
})

export const UserRatingDaoService = model<IUserRatingDao>(
  'UserRating',
  UserRatingSchema,
)
