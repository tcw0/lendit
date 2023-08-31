import {
  InsuranceTypeEnum,
  NewRentalDto,
  RentalMetadataDto,
} from '@api/generated'
import mongoose from 'mongoose'
import {
  IRentalDao,
  RentalDaoService,
  RentalRole,
  RentalStateEnumDao,
} from 'src/models/RentalDao'
import { IItemDao } from 'src/models/ItemDao'
import { ApiError, ApiErrorCodes } from 'src/middleware/errorhandler/APIError'
import {
  convertInsuranceTypeDtoToDao,
  convertRentalDaoToMetadataDto,
} from './converters/rentalConverterService'
import { getItemById } from './itemService'

/**
 * Get the role of a user in a rental and check if the user is authorized to access the rental.
 * @param {ObjectId} rentalId the id of the rental.
 * @param {ObjectId} userId the id of the user.
 * @throws {ApiError} if the rental does not exist or the user is not authorized to access the rental.
 * @returns {Promise<{role: RentalRole, rental: IRentalDao}>} the role of the user in the rental and the rental.
 */
export const getRentalWithAccessCheckAndRole = async (
  rentalId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
): Promise<{ role: RentalRole; rentalDao: IRentalDao }> => {
  const rentalDao = await RentalDaoService.findById(rentalId)
  if (!rentalDao) {
    throw new ApiError(
      ApiErrorCodes.NOT_FOUND,
      `Could not find rental with id ${rentalId.toString()}.`,
    )
  }

  if (rentalDao.renterId.toString() === userId.toString()) {
    return { role: RentalRole.RENTER, rentalDao }
  }
  if (rentalDao.lenderId.toString() === userId.toString()) {
    return { role: RentalRole.LENDER, rentalDao }
  }
  throw new ApiError(
    ApiErrorCodes.FORBIDDEN,
    `User ${userId.toString()} is not allowed to access the rental with id ${rentalId.toString()} as user is not lender or renter of this rental.`,
  )
}

/**
 * Calculate the rental price for an item based on dates.
 * @param {Date} start the start date of the rental.
 * @param {Date} end the end date of the rental.
 * @param {IItemDao} item the item to rent.
 * @throws {ApiError} if the start date is after the end date.
 * @returns {number} the calculated rental price.
 */
const calculateRentalPrice = (days: number, item: IItemDao): number => {
  if (days < 1) {
    throw new ApiError(
      ApiErrorCodes.CONFLICT,
      'Start date of a rental must be before its end date.',
    )
  }
  const price = item.priceNextDays * days + item.priceFirstDay
  return price
}

/**
 * Calculate the insurance price for an item based on the duration of the rental and the insurance type.
 * @param {number} days the duration of the rental in days.
 * @param {InsuranceTypeEnum} insuranceType the type of insurance.
 * @param {IItemDao} item the item to rent.
 * @throws {ApiError} if the item requires insurance but the rental does not have insurance.
 * @returns {number} the calculated insurance price.
 */
const calculateInsurancePrice = (
  fullPrice: number,
  insuranceType: InsuranceTypeEnum,
  item: IItemDao,
): number => {
  if (insuranceType === InsuranceTypeEnum.NONE && item.insuranceReq) {
    throw new ApiError(
      ApiErrorCodes.CONFLICT,
      `Insurance is required for this item with id ${item._id.toString()}.`,
    )
  }
  switch (insuranceType) {
    case InsuranceTypeEnum.NONE:
      return 0
    case InsuranceTypeEnum.BASIC:
      return Math.floor(fullPrice * 0.1)
    case InsuranceTypeEnum.PREMIUM:
      return Math.floor(fullPrice * 0.3)
    default:
      throw new ApiError(
        ApiErrorCodes.INTERNAL_SERVER_ERROR,
        `Unknown insurance type ${insuranceType}.`,
      )
  }
}

/**
 * Create a new rental including a payment and a first system chat message.
 * @param {NewRentalDto} rentalDto the rental to create.
 * @param {ObjectId} renterUserId the id of the user who creates the rental.
 * @throws {ApiError} if the rental could not be created.
 * @returns {Promise<IRentalDao>} the newly created rental.
 */
export const createNewRental = async (
  rentalDto: NewRentalDto,
  renterUserId: mongoose.Types.ObjectId,
) => {
  const item = await getItemById(new mongoose.Types.ObjectId(rentalDto.itemId))

  const rentalDays = Math.ceil(
    (new Date(rentalDto.end).getTime() - new Date(rentalDto.start).getTime()) /
      (1000 * 3600 * 24),
  )
  const calculatedPrice = calculateRentalPrice(rentalDays, item)
  const calculatedInsurancePrice = calculateInsurancePrice(
    calculatedPrice,
    rentalDto.insuranceType,
    item,
  )

  const newRental = await RentalDaoService.create({
    startRental: Date.parse(rentalDto.start),
    endRental: Date.parse(rentalDto.end),
    payment: {
      rentalAmount: calculatedPrice,
      insuranceAmount: calculatedInsurancePrice,
    },
    itemId: item._id,
    insuranceType: convertInsuranceTypeDtoToDao(rentalDto.insuranceType),
    renterId: renterUserId,
    lenderId: item.lenderId,
    rentalState: RentalStateEnumDao.OFFER,
    returnHandover: undefined,
    pickUpHandover: undefined,
    messages: [
      {
        message: 'New rental request.',
        timestamp: new Date().toISOString(),
        isRead: false,
        isSystemMessage: true,
        authorId: renterUserId.toString(),
      },
    ],
    renterRatingId: undefined,
    lenderRatingId: undefined,
    itemRatingId: undefined,
  })

  if (!newRental) {
    throw new ApiError(
      ApiErrorCodes.INTERNAL_SERVER_ERROR,
      'Could not create new rental.',
    )
  }

  return newRental
}

/**
 * Get all rentals of a user.
 * @param {ObjectId} userId the id of the user who wants to get all its rental.
 * @returns {Promise<IRentalDao[]>} all rentals of the user (either as renter or lender).
 */
export const getAllRentals = async (
  userId: mongoose.Types.ObjectId,
): Promise<IRentalDao[]> => {
  const rentals: IRentalDao[] = await RentalDaoService.find({
    $or: [{ renterId: userId }, { lenderId: userId }],
  })
  return rentals.sort((a, b) =>
    a.messages[a.messages.length - 1].timestamp >
    b.messages[b.messages.length - 1].timestamp
      ? -1
      : 1,
  )
}

/**
 * Get all rentals of a user as metadata.
 * @param {ObjectId} userId the id of the user who wants to get all its rentals.
 * @returns {Promise<RentalMetadataDto[]>} all rentals of the user (either as renter or lender) as metadata.
 */
export const getAllRentalsMetadata = async (
  userId: mongoose.Types.ObjectId,
): Promise<RentalMetadataDto[]> => {
  const rentals = await getAllRentals(userId)
  const rentalMetadata = Promise.all(
    rentals.map(async rentalDao =>
      convertRentalDaoToMetadataDto(rentalDao, userId),
    ),
  )
  return rentalMetadata
}

/**
 * Update the state of a rental after a handover, payment or rating if necessary.
 * @param {ObjectId} rentalId
 * @throws {ApiError} if the rental does not exist or one of the foreign keys is wrong.
 */
export const updateRentalStateAfterAction = async (
  rentalId: mongoose.Types.ObjectId,
): Promise<IRentalDao> => {
  const rentalDao = await RentalDaoService.findById(rentalId)
  if (!rentalDao) {
    throw new ApiError(
      ApiErrorCodes.NOT_FOUND,
      `Could not find rental with id ${rentalId.toString()}.`,
    )
  }

  // If the lender is already paid, close the rental (CLOSED)
  if (rentalDao.payment.paymentToLender) {
    rentalDao.rentalState = RentalStateEnumDao.CLOSED
    return rentalDao.save()
  }

  if (
    rentalDao.itemRatingId &&
    rentalDao.lenderRatingId &&
    rentalDao.renterRatingId
  ) {
    // If the lender and renter rated each other and the item, set ot RATED
    rentalDao.rentalState = RentalStateEnumDao.RATED
    return rentalDao.save()
  }
  if (rentalDao.returnHandover) {
    if (
      rentalDao.returnHandover.agreedLender &&
      rentalDao.returnHandover.agreedRenter
    ) {
      // If the lender and renter agreed on the return, set it to RETURN_CONFIRMED
      rentalDao.rentalState = RentalStateEnumDao.RETURN_CONFIRMED
      return rentalDao.save()
    }
    if (
      rentalDao.returnHandover.agreedLender ||
      rentalDao.returnHandover.agreedRenter
    ) {
      // If the lender or renter agreed on the return, set it to RETURNED
      rentalDao.rentalState = RentalStateEnumDao.RETURNED
      return rentalDao.save()
    }
  }
  if (rentalDao.pickUpHandover) {
    if (
      rentalDao.pickUpHandover.agreedLender &&
      rentalDao.pickUpHandover.agreedRenter
    ) {
      // If the lender and renter agreed on the pick up, set it to PICK_UP_CONFIRMED
      rentalDao.rentalState = RentalStateEnumDao.PICK_UP_CONFIRMED
      return rentalDao.save()
    }
    if (
      rentalDao.pickUpHandover.agreedLender ||
      rentalDao.pickUpHandover.agreedRenter
    ) {
      // If the lender or renter agreed on the pick up, set it to PICKED_UP
      rentalDao.rentalState = RentalStateEnumDao.PICKED_UP
      return rentalDao.save()
    }
  }
  if (rentalDao.payment.paymentFromRenter) {
    // If the renter has already paid, set it to PAID
    rentalDao.rentalState = RentalStateEnumDao.PAID
    return rentalDao.save()
  }

  return rentalDao
}

/**
 * Marks all chats coming from the other user as read.
 * @param {ObjectId} rentalId the id of the rental.
 * @param {ObjectId} userId the id of the user who wants to mark the chats of the other user as read.
 */
export const markChatsAsRead = async (
  rentalId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
): Promise<void> => {
  const { rentalDao } = await getRentalWithAccessCheckAndRole(rentalId, userId)
  rentalDao.messages.forEach(message => {
    if (message.authorId.toString() !== userId.toString()) {
      // eslint-disable-next-line no-param-reassign
      message.isRead = true
    }
  })
  await rentalDao.save()
}
