import { Document, Schema } from 'mongoose'

export interface ITimeSpanDao extends Document {
  start: Date
  end: Date
}

export const TimeSpanSchema = new Schema<ITimeSpanDao>({
  start: { type: Schema.Types.Date, required: true },
  end: { type: Schema.Types.Date, required: true },
})
