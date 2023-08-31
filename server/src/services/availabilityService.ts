import mongoose from 'mongoose'
import { IAvailabilityDao } from 'src/models/AvailabilityDao'
import { IRentalDao } from 'src/models/RentalDao'
import { ITimeSpanDao } from 'src/models/TimeSpanDao'
import { ApiError, ApiErrorCodes } from 'src/middleware/errorhandler/APIError'
import { getItemById } from './itemService'

/**
 * Get availability by id of item
 * @param {ObjectId} itemId the item id
 * @returns {Promise<IAvailabilityDao>} the availability object
 */
export const getAvailabilityByItemId = async (
  itemId: mongoose.Types.ObjectId,
): Promise<IAvailabilityDao> => {
  const item = await getItemById(new mongoose.Types.ObjectId(itemId.toString()))
  const { availability } = item

  return availability
}

/**
 * Checks if the rental time span overlaps with the blacklist of the item.
 * @param {IAvailabilityDao} itemAvailability the availability of the item.
 * @param {IRentalDao} rentalDao the rental to check.
 * @returns {boolean} whether the rental time span overlaps with the blacklist of the item.
 */
const checkIfTimeSpanOverlaps = (
  itemAvailability: IAvailabilityDao,
  rentalDao: IRentalDao,
): boolean => {
  const blacklistOverlaps = itemAvailability.blacklist.some(
    blacklistTimeSpan => {
      return (
        (rentalDao.startRental >= blacklistTimeSpan.start &&
          rentalDao.startRental <= blacklistTimeSpan.end) ||
        (rentalDao.endRental >= blacklistTimeSpan.start &&
          rentalDao.endRental <= blacklistTimeSpan.end)
      )
    },
  )

  return blacklistOverlaps
}

/**
 * Adds the timespan of the rental to the availability blacklist of the item.
 * @param {IRentalDao} rentalDao the rental for which the timespan should be added to the blacklist.
 * @throws {ApiError} if the timespan of the rental overlaps with the availability blacklist of the item.
 * @returns {Promise<IRentalDao>} the rental DAO which was modified.
 */
export const addAvailabilityToBlacklistForRental = async (
  rentalDao: IRentalDao,
): Promise<IRentalDao> => {
  const item = await getItemById(
    new mongoose.Types.ObjectId(rentalDao.itemId.toString()),
  )
  if (checkIfTimeSpanOverlaps(item.availability, rentalDao)) {
    throw new ApiError(
      ApiErrorCodes.CONFLICT,
      `Item ${item._id.toString()} is not available during the timespan of the rental.`,
    )
  }
  item.availability.blacklist = item.availability.blacklist.concat({
    start: rentalDao.startRental,
    end: rentalDao.endRental,
  } as ITimeSpanDao)
  await item.save()

  return rentalDao
}
