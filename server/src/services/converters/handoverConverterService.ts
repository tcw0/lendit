import { HandoverDto, HandoverTypeEnum, PictureDto } from '@api/generated'
import { ApiError, ApiErrorCodes } from 'src/middleware/errorhandler/APIError'
import { HandoverTypeEnumDao, IHandoverDao } from 'src/models/HandoverDao'

/**
 * Converts a handover type DAO to a handover type DTO.
 * @param {HandoverTypeEnumDao} handoverTypeEnumDao the handover type to convert.
 * @throws {ApiError} if the handover type is invalid.
 * @returns {HandoverTypeEnum} the converted handover type.
 */
export const convertHandoverTypeEnumDaoToDto = (
  handoverTypeEnumDao: HandoverTypeEnumDao,
) => {
  switch (handoverTypeEnumDao) {
    case HandoverTypeEnumDao.PICKUP:
      return HandoverTypeEnum.PICKUP
    case HandoverTypeEnumDao.RETURN:
      return HandoverTypeEnum.RETURN
    default:
      throw new ApiError(
        ApiErrorCodes.INTERNAL_SERVER_ERROR,
        `Invalid handover type of ${handoverTypeEnumDao}.`,
      )
  }
}

/**
 * Converts a handover type DTO to a handover type DAO.
 * @param {HandoverTypeEnum} handoverTypeEnumDto the handover type to convert.
 * @throws {ApiError} if the handover type is invalid.
 * @returns {HandoverTypeEnumDao} the converted handover type.
 */
export const convertHandoverTypeEnumDtoToDao = (
  handoverTypeEnumDto: HandoverTypeEnum,
) => {
  switch (handoverTypeEnumDto) {
    case HandoverTypeEnum.PICKUP:
      return HandoverTypeEnumDao.PICKUP
    case HandoverTypeEnum.RETURN:
      return HandoverTypeEnumDao.RETURN
    default:
      throw new ApiError(
        ApiErrorCodes.BAD_REQUEST,
        `Invalid handover type of ${handoverTypeEnumDto}.`,
      )
  }
}

/**
 * Converts a handover DAO to a handover DTO.
 * @param {IHandoverDao} handoverDao the handover to convert.
 * @returns {HandoverDto} the converted handover.
 */
export const convertHandoverDaoToDto = (
  handoverDao: IHandoverDao,
): HandoverDto => {
  return {
    id: handoverDao._id.toString(),
    pictures: handoverDao.pictures.map(
      picture => ({ url: picture } as PictureDto),
    ),
    comment: handoverDao.comment,
    agreedRenter: handoverDao.agreedRenter?.toISOString(),
    agreedLender: handoverDao.agreedLender?.toISOString(),
    handoverType: convertHandoverTypeEnumDaoToDto(handoverDao.handoverType),
  } as HandoverDto
}
