import { ChatMessageDto } from '@api/generated'
import { IChatMessageDao } from 'src/models/ChatMessageDao'

/**
 * Converts a chatmessage DAO to a chatmessage DTO.
 * @param {IChatMessageDao} chatMessageDao the chatmessage to convert.
 * @returns {ChatMessageDto} the converted chatmessage.
 */
export const convertChatMessageDaoToDto = (
  chatMessageDao: IChatMessageDao,
): ChatMessageDto => {
  return {
    id: chatMessageDao._id.toString(),
    text: chatMessageDao.message,
    time: chatMessageDao.timestamp.toISOString(),
    isRead: chatMessageDao.isRead,
    isSystemMessage: chatMessageDao.isSystemMessage,
    authorId: chatMessageDao.authorId?.toString(),
  } as ChatMessageDto
}

export default convertChatMessageDaoToDto
