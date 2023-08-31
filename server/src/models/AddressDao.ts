import { model, Document, Schema } from 'mongoose'
import { latitudeValidator, longitudeValidator } from './validator'

export interface IAddressDao extends Document {
  street: string
  city: string
  zipCode: string
  latitude: number
  longitude: number
}

const AddressSchema = new Schema<IAddressDao>({
  street: { type: Schema.Types.String, required: true },
  city: { type: Schema.Types.String, required: true },
  zipCode: { type: Schema.Types.String, required: true },
  latitude: {
    type: Schema.Types.Number,
    required: true,
    validate: latitudeValidator,
  },
  longitude: {
    type: Schema.Types.Number,
    required: true,
    validate: longitudeValidator,
  },
})

export const AddressDaoService = model<IAddressDao>('Address', AddressSchema)
