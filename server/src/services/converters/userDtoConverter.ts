import {
  AddressDto,
  PictureDto,
  UserDto,
  UserMetaDataDto,
} from '@api/generated'
import { IUserDao } from 'src/models/UserDao'
import { AddressDaoService, IAddressDao } from 'src/models/AddressDao'
import { ApiError, ApiErrorCodes } from 'src/middleware/errorhandler/APIError'
// eslint-disable-next-line import/no-cycle
import { convertAggregatedRatingDaoToDto } from './ratingConverterService'
import { convertAddressDaoToDto } from './addressConverterService'

/**
 * Converts a user DAO to a user DTO.
 * @param {IUserDao} userDao the user to convert.
 * @throws {ApiError} if the users foreign key references are invalid.
 * @returns {Promise<UserDto>} the converted user.
 */
export const convertUserDaoToDto = async (
  userDao: IUserDao,
): Promise<UserDto> => {
  const address: IAddressDao | null = await AddressDaoService.findById(
    userDao.addressIds[0],
  )
  if (!address) {
    throw new ApiError(
      ApiErrorCodes.NOT_FOUND,
      `Address for user ${userDao._id.toString()} with id ${userDao.addressIds[0].toString()} not found`,
    )
  }

  const addressDto: AddressDto = convertAddressDaoToDto(address)

  return {
    id: userDao._id.toString(),
    name: userDao.name,
    email: userDao.email,
    description: userDao.description,
    picture: userDao.picture ? { url: userDao.picture } : undefined,
    registeredSince: userDao.registeredSince.toISOString(),
    avgRating: convertAggregatedRatingDaoToDto(userDao.avgRating),
    address: addressDto,
  }
}

/**
 * Converts a user DAO to a user meta data DTO.
 * @param {IUserDao} userDao the user to convert.
 * @throws {ApiError} if the users foreign key references are invalid.
 * @returns {UserMetaDataDto} the converted user.
 */
export const convertUserDaoToUserMetaDataDto = (
  userDao: IUserDao,
): UserMetaDataDto => {
  return {
    id: userDao._id.toString(),
    name: userDao.name,
    picture: userDao.picture
      ? ({ url: userDao.picture } as PictureDto)
      : undefined,
    registeredSince: userDao.registeredSince.toISOString(),
    avgRating: convertAggregatedRatingDaoToDto(userDao.avgRating),
  } as UserMetaDataDto
}
