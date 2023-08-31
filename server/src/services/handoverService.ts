import { HandoverTypeEnum, NewHandoverDto } from '@api/generated'
import { HandoverDaoService, IHandoverDao } from 'src/models/HandoverDao'
import {
  IRentalDao,
  RentalRole,
  RentalStateEnumDao,
} from 'src/models/RentalDao'
import { ApiError, ApiErrorCodes } from 'src/middleware/errorhandler/APIError'
import { convertHandoverTypeEnumDtoToDao } from './converters/handoverConverterService'

/**
 *
 * @param {IHandoverDao} handoverDao the handover to update
 * @param {RentalRole} role the role of the user requesting the update
 * @throws {ApiError} if the handover mofiying the agreed date for the wrong role
 * @returns {Promise<IHandoverDao>} the updated handover
 */
const setAgreedFromRoleAndDto = async (
  handoverDao: IHandoverDao,
  role: RentalRole,
): Promise<IHandoverDao> => {
  if (role === RentalRole.RENTER) {
    // eslint-disable-next-line no-param-reassign
    handoverDao.agreedRenter = new Date()
  } else if (role === RentalRole.LENDER) {
    // eslint-disable-next-line no-param-reassign
    handoverDao.agreedLender = new Date()
  } else {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      'Only renter and lender can agree on a handover.',
    )
  }
  await handoverDao.save()

  return handoverDao
}

/**
 * Creates a new handover for a rental.
 * @param {NewHandoverDto} handoverDto the handover to create.
 * @param {RentalRole} role the role of the user creating the handover
 * @throws {ApiError} if the handover could not be created.
 * @returns {Promise<IHandoverDao>} the newly created handover.
 */
export const createNewHandover = async (
  handoverDto: NewHandoverDto,
  role: RentalRole,
): Promise<IHandoverDao> => {
  const newHandover = await HandoverDaoService.create({
    pictures: handoverDto.pictures.map(picture => picture.url),
    comment: handoverDto.comment,
    handoverType: convertHandoverTypeEnumDtoToDao(handoverDto.handoverType),
  })

  if (!newHandover) {
    throw new ApiError(
      ApiErrorCodes.INTERNAL_SERVER_ERROR,
      'Could not create new handover.',
    )
  }

  const updatedNewHandoverDao = await setAgreedFromRoleAndDto(newHandover, role)
  await updatedNewHandoverDao.save()
  return updatedNewHandoverDao
}

/**
 * Checks if a handover is valid for a rental and the role of the user.
 * @param {NewHandoverDto} handoverDto the handover to check.
 * @param {RentalRole} role the role of the user.
 * @param {IRentalDao} rentalDao the rental to use while checking.
 * @throws {ApiError} if the handover is not valid for the rental or the role of the user
 */
export const ensureHandoverOnCreationValidity = (
  handoverDto: NewHandoverDto,
  role: RentalRole,
  rentalDao: IRentalDao,
): void => {
  // ensure, that the rental is in the correct state for posting this specific handover
  if (
    handoverDto.handoverType === HandoverTypeEnum.PICKUP &&
    rentalDao.rentalState !== RentalStateEnumDao.PAID
  ) {
    throw new ApiError(
      ApiErrorCodes.CONFLICT,
      `Rental ${rentalDao._id.toString()} must be paid before pickup.`,
    )
  } else if (
    handoverDto.handoverType === HandoverTypeEnum.RETURN &&
    rentalDao.rentalState !== RentalStateEnumDao.PICK_UP_CONFIRMED
  ) {
    throw new ApiError(
      ApiErrorCodes.CONFLICT,
      `Rental ${rentalDao._id.toString()} must be picked up before return.`,
    )
  }
}

/**
 * Checks if a rental is in a valid state for modifying the handover of given type.
 * @param {HandoverTypeEnum} handoverType the type of the handover to be modified.
 * @param {IRentalDao} rentalDao the rental to use while checking.
 * @throws {ApiError} if the rental is not valid for the handover modification request.
 */
export const ensureHandoverOnModificationValidity = async (
  handoverType: HandoverTypeEnum,
  rentalDao: IRentalDao,
): Promise<void> => {
  if (handoverType === HandoverTypeEnum.PICKUP) {
    if (
      !rentalDao.pickUpHandover ||
      rentalDao.rentalState !== RentalStateEnumDao.PICKED_UP
    ) {
      throw new ApiError(
        ApiErrorCodes.CONFLICT,
        `The rental ${rentalDao._id.toString()} must be picked up before pickup handover can be accepted.`,
      )
    }
  } else if (handoverType === HandoverTypeEnum.RETURN) {
    if (
      !rentalDao.returnHandover ||
      rentalDao.rentalState !== RentalStateEnumDao.RETURNED
    ) {
      throw new ApiError(
        ApiErrorCodes.CONFLICT,
        `The rental ${rentalDao._id.toString()} must be returned up before return handover can be accepted.`,
      )
    }
  }
}

/**
 * Accept a handover.
 * @param {IHandoverDao} handover the handover to accept
 * @param {RentalRole} role the role of the user
 * @returns {Promise<IHandoverDao>} the updated handover
 */
export const acceptHandover = async (
  handoverDao: IHandoverDao,
  role: RentalRole,
): Promise<IHandoverDao> => {
  if (role === RentalRole.RENTER) {
    // eslint-disable-next-line no-param-reassign
    handoverDao.agreedRenter = new Date()
  } else if (role === RentalRole.LENDER) {
    // eslint-disable-next-line no-param-reassign
    handoverDao.agreedLender = new Date()
  }
  return handoverDao
}
