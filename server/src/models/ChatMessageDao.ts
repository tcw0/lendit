import mongoose, { Document, Schema } from 'mongoose'

export interface IChatMessageDao extends Document {
  message: string
  timestamp: Date
  isRead: boolean
  isSystemMessage: boolean
  authorId: mongoose.Types.ObjectId
}

export const ChatMessageSchema = new Schema<IChatMessageDao>({
  message: { type: Schema.Types.String, required: true },
  timestamp: { type: Schema.Types.Date, required: true },
  isRead: { type: Schema.Types.Boolean, required: true },
  isSystemMessage: { type: Schema.Types.Boolean, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User' },
})
