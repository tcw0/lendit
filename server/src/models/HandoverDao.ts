import { model, Document, Schema } from 'mongoose'

export enum HandoverTypeEnumDao {
  PICKUP = 'Pickup',
  RETURN = 'Return',
}

export interface IHandoverDao extends Document {
  pictures: string[]
  comment: string
  agreedRenter?: Date
  agreedLender?: Date
  handoverType: HandoverTypeEnumDao
}

export const HandoverSchema = new Schema<IHandoverDao>({
  pictures: { type: [Schema.Types.String], required: true },
  comment: { type: Schema.Types.String, required: true },
  agreedRenter: { type: Schema.Types.Date, required: false },
  agreedLender: { type: Schema.Types.Date, required: false },
  handoverType: {
    type: Schema.Types.String,
    enum: Object.values(HandoverTypeEnumDao),
    required: true,
  },
})

export const HandoverDaoService = model<IHandoverDao>(
  'Handover',
  HandoverSchema,
)
