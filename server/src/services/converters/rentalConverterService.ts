import {
  InsuranceTypeEnum,
  PictureDto,
  RentalDto,
  RentalMetadataDto,
  RentalRoleEnum,
  RentalStateEnum,
} from '@api/generated'
import mongoose from 'mongoose'
import {
  IRentalDao,
  InsuranceTypeEnumDao,
  RentalStateEnumDao,
} from 'src/models/RentalDao'
import { IItemDao } from 'src/models/ItemDao'
import { IUserDao } from 'src/models/UserDao'
import { ApiError, ApiErrorCodes } from 'src/middleware/errorhandler/APIError'
import { getItemById } from '../itemService'
import { getUserByUserId } from '../userService'

/**
 * Converts a rental state enum DTO to a rental state enum DAO.
 * @param {RentalStateEnum} rentalState the rental state to convert.
 * @throws {ApiError} if the rental state is invalid.
 * @returns {RentalStateEnumDao} the converted rental state.
 */
export const convertRentalStateEnumDtoToDao = (
  rentalState: RentalStateEnum,
): RentalStateEnumDao => {
  switch (rentalState) {
    case RentalStateEnum.OFFER:
      return RentalStateEnumDao.OFFER
    case RentalStateEnum.ACCEPTED:
      return RentalStateEnumDao.ACCEPTED
    case RentalStateEnum.DECLINED:
      return RentalStateEnumDao.DECLINED
    case RentalStateEnum.PAID:
      return RentalStateEnumDao.PAID
    case RentalStateEnum.PICKED_UP:
      return RentalStateEnumDao.PICKED_UP
    case RentalStateEnum.PICK_UP_CONFIRMED:
      return RentalStateEnumDao.PICK_UP_CONFIRMED
    case RentalStateEnum.RETURNED:
      return RentalStateEnumDao.RETURNED
    case RentalStateEnum.RETURN_CONFIRMED:
      return RentalStateEnumDao.RETURN_CONFIRMED
    case RentalStateEnum.RATED:
      return RentalStateEnumDao.RATED
    case RentalStateEnum.CLOSED:
      return RentalStateEnumDao.CLOSED
    default:
      throw new ApiError(
        ApiErrorCodes.BAD_REQUEST,
        `Invalid rental state of ${rentalState}.`,
      )
  }
}

/**
 * Converts a rental state enum DAO to a rental state enum DTO.
 * @param {RentalStateEnumDao} rentalStateDao the rental state to convert.
 * @throws {ApiError} if the rental state is invalid.
 * @returns {RentalStateEnum} the converted rental state.
 */
export const convertRentalStateEnumDaoToDto = (
  rentalStateDao: RentalStateEnumDao,
): RentalStateEnum => {
  switch (rentalStateDao) {
    case RentalStateEnumDao.OFFER:
      return RentalStateEnum.OFFER
    case RentalStateEnumDao.ACCEPTED:
      return RentalStateEnum.ACCEPTED
    case RentalStateEnumDao.DECLINED:
      return RentalStateEnum.DECLINED
    case RentalStateEnumDao.PAID:
      return RentalStateEnum.PAID
    case RentalStateEnumDao.PICKED_UP:
      return RentalStateEnum.PICKED_UP
    case RentalStateEnumDao.PICK_UP_CONFIRMED:
      return RentalStateEnum.PICK_UP_CONFIRMED
    case RentalStateEnumDao.RETURNED:
      return RentalStateEnum.RETURNED
    case RentalStateEnumDao.RETURN_CONFIRMED:
      return RentalStateEnum.RETURN_CONFIRMED
    case RentalStateEnumDao.RATED:
      return RentalStateEnum.RATED
    case RentalStateEnumDao.CLOSED:
      return RentalStateEnum.CLOSED
    default:
      throw new ApiError(
        ApiErrorCodes.INTERNAL_SERVER_ERROR,
        `Invalid rental state of ${rentalStateDao}.`,
      )
  }
}

/**
 * Converts a insurance type enum DAO to a insurance type enum DTO.
 * @param {InsuranceTypeEnumDao} insuranceTypeDao the insurance type to convert as DAO.
 * @returns {InsuranceTypeEnum} the converted insurance type as DTO.
 */
export const convertInsuranceTypeDaoToDto = (
  insuranceTypeDao: InsuranceTypeEnumDao,
): InsuranceTypeEnum => {
  switch (insuranceTypeDao) {
    case InsuranceTypeEnumDao.NONE:
      return InsuranceTypeEnum.NONE
    case InsuranceTypeEnumDao.BASIC:
      return InsuranceTypeEnum.BASIC
    case InsuranceTypeEnumDao.PREMIUM:
      return InsuranceTypeEnum.PREMIUM
    default:
      throw new ApiError(
        ApiErrorCodes.INTERNAL_SERVER_ERROR,
        `Invalid insurance type of ${insuranceTypeDao}.`,
      )
  }
}

/**
 * Converts a insurance type enum DTO to a insurance type enum DAO.
 * @param {InsuranceTypeEnumDao} insuranceTypeDao the insurance type to convert as DTO.
 * @returns {InsuranceTypeEnum} the converted insurance type as DAO.
 */
export const convertInsuranceTypeDtoToDao = (
  insuranceTypeDao: InsuranceTypeEnum,
): InsuranceTypeEnumDao => {
  switch (insuranceTypeDao) {
    case InsuranceTypeEnum.NONE:
      return InsuranceTypeEnumDao.NONE
    case InsuranceTypeEnum.BASIC:
      return InsuranceTypeEnumDao.BASIC
    case InsuranceTypeEnum.PREMIUM:
      return InsuranceTypeEnumDao.PREMIUM
    default:
      throw new ApiError(
        ApiErrorCodes.INTERNAL_SERVER_ERROR,
        `Invalid insurance type of ${insuranceTypeDao}.`,
      )
  }
}

/**
 * Converts a rental dao to a rental dto.
 * @param {IRentalDao} rentalDao the rental to convert.
 * @returns {RentalDto} the converted rental.
 */
export const convertRentalDaoToDto = async (
  rentalDao: IRentalDao,
): Promise<RentalDto> => {
  return {
    id: rentalDao.id.toString(),
    start: rentalDao.startRental.toISOString(),
    end: rentalDao.endRental.toISOString(),
    price: rentalDao.payment.rentalAmount,
    insurancePrice: rentalDao.payment.insuranceAmount,
    insuranceType: convertInsuranceTypeDaoToDto(rentalDao.insuranceType),
    itemId: rentalDao.itemId.toString(),
    renterId: rentalDao.renterId.toString(),
    lenderId: rentalDao.lenderId.toString(),
    rentalState: rentalDao.rentalState.toString(),
  } as RentalDto
}

/**
 * Converts a rental dao to a rental metadata dto.
 * @param {IRentalDao} rentalDao the rental to convert.
 * @param {ObjectId} userId the id of the user who wants to get the metadata (used to get unread messages).
 * @returns {RentalMetadataDto} the converted rental metadata.
 */
export const convertRentalDaoToMetadataDto = async (
  rentalDao: IRentalDao,
  userId: mongoose.Types.ObjectId,
): Promise<RentalMetadataDto> => {
  const item: IItemDao = await getItemById(
    new mongoose.Types.ObjectId(rentalDao.itemId.toString()),
    true,
  )
  const renter: IUserDao = await getUserByUserId(
    new mongoose.Types.ObjectId(rentalDao.renterId.toString()),
    true,
  )
  const lender: IUserDao = await getUserByUserId(
    new mongoose.Types.ObjectId(rentalDao.lenderId.toString()),
    true,
  )
  const rentingRole: RentalRoleEnum =
    userId.toString() === rentalDao.renterId.toString()
      ? RentalRoleEnum.RENTER
      : RentalRoleEnum.LENDER
  return {
    id: rentalDao.id.toString(),
    itemName: item.title,
    renterName: renter.name,
    lenderName: lender.name,
    unreadMessages: rentalDao.messages.filter(
      m =>
        !m.isRead && m.authorId && m.authorId.toString() !== userId.toString(),
    ).length,
    itemPicture: { url: item.pictures[0] } as PictureDto,
    rentalState: convertRentalStateEnumDaoToDto(rentalDao.rentalState),
    role: rentingRole,
  } as RentalMetadataDto
}
