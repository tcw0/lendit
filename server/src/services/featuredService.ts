import { NewFeaturedDto } from '@api/generated'
import mongoose from 'mongoose'
import { ApiError, ApiErrorCodes } from 'src/middleware/errorhandler/APIError'
import { IItemDao } from 'src/models/ItemDao'
import { getItemById } from './itemService'

/**
 * Add a number of days to a date.
 * @param {Date} date the date to add days to.
 * @param {number} days the number of days to add.
 * @returns {Date} the new date.
 */
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Calculate the price for a featured timespan.
 * @param {number} durationInDays the duration of the featured timespan in days.
 * @throws {ApiError} If the duration is not 7, 30, 90 or 365 days.
 * @returns {number} the price for the featured timespan in cents.
 */
export const getFeaturedPrice = (durationInDays: number): number => {
  switch (durationInDays) {
    case 7:
      return 199
    case 30:
      return 499
    case 90:
      return 999
    case 365:
      return 2599
    default:
      throw new ApiError(
        ApiErrorCodes.BAD_REQUEST,
        `Invalid duration featured duration of ${durationInDays} days.`,
      )
  }
}

/**
 * Add a new featured timespan to an item.
 * @param {ObjectId} itemId the ID of the item to add the featured timespan to.
 * @param {NewFeaturedDto} featured the featured timespan to add.
 * @returns {Promise<IFeaturedDao>} the newly added featured timespan.
 */
export const addFeaturedToItemById = async (
  itemId: mongoose.Types.ObjectId,
  featured: NewFeaturedDto,
): Promise<IItemDao> => {
  const item = await getItemById(itemId)
  if (item.featuredUntil) {
    const startDate =
      new Date(item.featuredUntil) < new Date()
        ? new Date()
        : new Date(item.featuredUntil)
    const endDate = addDays(startDate, featured.durationInDays)
    item.featuredUntil = endDate
  } else {
    const startDate = new Date()
    const endDate = addDays(startDate, featured.durationInDays)
    item.featuredUntil = endDate
  }
  return item.save()
}

export default addFeaturedToItemById
