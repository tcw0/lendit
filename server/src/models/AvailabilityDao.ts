import { Document, Schema } from 'mongoose'
import { ITimeSpanDao, TimeSpanSchema } from './TimeSpanDao'

export enum WeekdayEnumDao {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday',
}

export interface IAvailabilityDao extends Document {
  whitelist: ITimeSpanDao[]
  blacklist: ITimeSpanDao[]
  availableWeekdays: WeekdayEnumDao[]
}

export const AvailabilitySchema = new Schema<IAvailabilityDao>({
  whitelist: { type: [TimeSpanSchema], required: true },
  blacklist: { type: [TimeSpanSchema], required: true },
  availableWeekdays: {
    type: [Schema.Types.String],
    enum: Object.values(WeekdayEnumDao),
    required: true,
  },
})
