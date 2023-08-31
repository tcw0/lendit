import { NewRatingDto } from '@api/generated'
import mongoose from 'mongoose'
import { ApiError, ApiErrorCodes } from 'src/middleware/errorhandler/APIError'
import { IAggregatedRatingDao } from 'src/models/AggregatedRatingDao'
import { IItemDao, ItemDaoService } from 'src/models/ItemDao'
import { IItemRatingDao, ItemRatingDaoService } from 'src/models/ItemRatingDao'
import { IUserDao } from 'src/models/UserDao'
import { IUserRatingDao, UserRatingDaoService } from 'src/models/UserRatingDao'
import { getUserByUserId } from './userService'

/**
 * Get all the item rating DAOs for a given item.
 * @param {ObjectId} itemId the id of the item for while the ratings are requested.
 * @returns {Promise<IItemRatingDao[]>} all item rating DAOs.
 */
export const getAllItemRatingsForItem = async (
  itemId: mongoose.Types.ObjectId,
): Promise<IItemRatingDao[]> => {
  const itemRatings: IItemRatingDao[] | null = await ItemRatingDaoService.find({
    ratedItemId: itemId,
  })
  return itemRatings || []
}

/**
 * Get all the user rating DAOs for a given user.
 * @param {ObjectId} userId the id of the rated user.
 * @returns {Promise<IUserRatingDao[]>} all the user rating DAOs.
 */
export const getAllUserRatingsForUser = async (
  userId: mongoose.Types.ObjectId,
): Promise<IUserRatingDao[]> => {
  const userRatings: IUserRatingDao[] | null = await UserRatingDaoService.find({
    ratedUserId: userId,
  })
  return userRatings || []
}

/**
 * Get the user rating by id.
 * @param {ObjectId} userRatingId the id of the user rating to get.
 * @throws {ApiError} if the user rating could not be found.
 * @returns {Promise<IUserRatingDao>} the user rating DAO.
 */
export const getUserRatingById = async (
  userRatingId: mongoose.Types.ObjectId,
): Promise<IUserRatingDao> => {
  const userRating: IUserRatingDao | null = await UserRatingDaoService.findById(
    userRatingId,
  )
  if (!userRating) {
    throw new ApiError(
      ApiErrorCodes.NOT_FOUND,
      `User rating with id ${userRatingId.toString()} not found.`,
    )
  }
  return userRating
}

/**
 * Get the item rating by id.
 * @param itemRatingId
 * @returns
 */
export const getItemRatingById = async (
  itemRatingId: mongoose.Types.ObjectId,
): Promise<IItemRatingDao> => {
  const itemRating: IItemRatingDao | null = await ItemRatingDaoService.findById(
    itemRatingId,
  )
  if (!itemRating) {
    throw new ApiError(
      ApiErrorCodes.NOT_FOUND,
      `Item rating with id ${itemRatingId.toString()} not found.`,
    )
  }
  return itemRating
}

/**
 * Creates a new user rating DAO with author id.
 * @param {NewRatingDto} userRating the user rating dto to create.
 * @param {ObjectId} ratedUserId the user id of the rated user.
 * @param {ObjectId} authorId the author id.
 * @returns {Promise<IUserRatingDao>} the newly created user rating DAO.
 */
export const createUserRatingForUser = async (
  userRating: NewRatingDto,
  ratedUserId: mongoose.Types.ObjectId,
  authorId: mongoose.Types.ObjectId,
): Promise<IUserRatingDao> => {
  const newUserRating: IUserRatingDao = await UserRatingDaoService.create({
    ratedUserId,
    stars: userRating.stars,
    text: userRating.text,
    time: new Date(),
    authorId,
  })

  if (!newUserRating) {
    throw new ApiError(
      ApiErrorCodes.INTERNAL_SERVER_ERROR,
      'Could not create new user rating.',
    )
  }

  return newUserRating
}

/**
 * Creates a new item rating DAO with author id.
 * @param {NewRatingDto} itemRating the item rating dto to create.
 * @param {ObjectId} itemId the item id.
 * @param {ObjectId} authorId the author id.
 * @returns {Promise<IItemRatingDao>} the newly created item rating DAO.
 */
export const createItemRatingForItem = async (
  itemRating: NewRatingDto,
  itemId: mongoose.Types.ObjectId,
  authorId: mongoose.Types.ObjectId,
): Promise<IItemRatingDao> => {
  const newItemRating: IItemRatingDao = await ItemRatingDaoService.create({
    ratedItemId: itemId,
    stars: itemRating.stars,
    text: itemRating.text,
    time: new Date(),
    authorId,
  })

  if (!newItemRating) {
    throw new ApiError(
      ApiErrorCodes.INTERNAL_SERVER_ERROR,
      'Could not create new item rating.',
    )
  }

  return newItemRating
}

/**
 * Updates the aggregated rating for a given item.
 * @param {ObjectId} itemId the id of the item for which the aggregated rating should be updated.
 * @throws {ApiError} if the item could not be found or the update was not successful.
 * @returns {Promise<IAggregatedRatingDao>} the updated aggregated rating DAO.
 */
export const updateAggregatedItemRatingByItemId = async (
  itemId: mongoose.Types.ObjectId,
): Promise<IAggregatedRatingDao> => {
  const itemDao: IItemDao | null = await ItemDaoService.findById(itemId)
  if (!itemDao) {
    throw new ApiError(
      ApiErrorCodes.NOT_FOUND,
      `Item with id ${itemId.toString()} not found.`,
    )
  }

  const itemRatings: IItemRatingDao[] = await getAllItemRatingsForItem(itemId)

  itemDao.avgRating = {
    averageRating:
      itemRatings.reduce((acc, curr) => acc + curr.stars, 0) /
      itemRatings.length,
    count: itemRatings.length,
  } as unknown as IAggregatedRatingDao

  await itemDao.save()
  return itemDao.avgRating
}

/**
 * Updates the aggregated rating for a given user.
 * @param {ObjectId} userId the id of the user for which the aggregated rating should be updated.
 * @throws {ApiError} if the user could not be found or the update was not successful.
 * @returns {Promise<IAggregatedRatingDao>} the updated aggregated rating DAO.
 */
export const updateAggregatedUserRatingByUserId = async (
  userId: mongoose.Types.ObjectId,
): Promise<IAggregatedRatingDao> => {
  const userDao: IUserDao = await getUserByUserId(userId)
  if (!userDao) {
    throw new ApiError(
      ApiErrorCodes.NOT_FOUND,
      `User with id ${userId.toString()} not found.`,
    )
  }

  const userRatings: IUserRatingDao[] = await getAllUserRatingsForUser(userId)

  userDao.avgRating = {
    averageRating:
      userRatings.reduce((acc, curr) => acc + curr.stars, 0) /
      userRatings.length,
    count: userRatings.length,
  } as unknown as IAggregatedRatingDao
  await userDao.save()

  return userDao.avgRating
}
