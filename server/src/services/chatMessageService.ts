import { NewChatMessageDto } from '@api/generated'
import mongoose, { ObjectId } from 'mongoose'
import { IChatMessageDao } from 'src/models/ChatMessageDao'
import { IRentalDao } from 'src/models/RentalDao'

/**
 * Creates a new chat message from a Dto.
 * @param {NewChatMessageDto} chatMessageDto the chat message to create.
 * @param {boolean} isSystemMessage whether the message is a system message.
 * @param {ObjectId} authorId the id of the author of the message.
 * @param {IRentalDao} rentalDao the rental to add the message to.
 * @throws {ApiError} if the chat message could not be created.
 * @returns {Promise<IChatMessageDao>} the updated rental.
 */
export const createNewChatMessage = async (
  chatMessageDto: NewChatMessageDto,
  isSystemMessage: boolean,
  authorId: mongoose.Types.ObjectId,
  rentalDao: IRentalDao,
): Promise<IChatMessageDao> => {
  rentalDao.messages.push({
    message: chatMessageDto.text,
    timestamp: new Date(),
    isRead: false,
    isSystemMessage,
    authorId: new mongoose.Types.ObjectId(authorId.toString()),
  } as IChatMessageDao)
  await rentalDao.save()

  return rentalDao.messages[rentalDao.messages.length - 1]
}

/**
 * Creates a new system message.
 * @param {string} message the message to create.
 * @param {ObjectId} authorId the id of the author of the message.
 * @param {IRentalDao} rentalDao the rental to add the message to.
 * @throws {ApiError} if the system message could not be created.
 * @returns {Promise<IRentalDao>} the updated rental.
 */
export const createNewSystemMessageForRental = async (
  message: string,
  authorId: ObjectId,
  rentalDao: IRentalDao,
): Promise<IRentalDao> => {
  rentalDao.messages.push({
    message,
    timestamp: new Date(),
    isRead: false,
    isSystemMessage: true,
    authorId: new mongoose.Types.ObjectId(authorId.toString()),
  } as IChatMessageDao)
  await rentalDao.save()

  return rentalDao
}
