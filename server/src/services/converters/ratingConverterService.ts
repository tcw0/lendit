import {
  AggregatedRatingDto,
  ItemRatingDto,
  UserRatingDto,
} from '@api/generated'

import { IAggregatedRatingDao } from 'src/models/AggregatedRatingDao'
import { IItemRatingDao } from 'src/models/ItemRatingDao'
import { IUserDao } from 'src/models/UserDao'
import { IUserRatingDao } from 'src/models/UserRatingDao'
import mongoose from 'mongoose'
// eslint-disable-next-line import/no-cycle
import { getUserByUserId } from '../userService'

/**
 * Converts an aggregated rating DAO to an aggregated rating DTO.
 * @param {IAggregatedRatingDao} aggregatedRatingDao the aggregated rating to convert.
 * @returns {AggregatedRatingDto} the converted aggregated rating.
 */
export const convertAggregatedRatingDaoToDto = (
  aggregatedRatingDao: IAggregatedRatingDao,
): AggregatedRatingDto => {
  const { averageRating, count } = aggregatedRatingDao
  return {
    avgRating: averageRating,
    count,
  }
}

/**
 * Converts a user rating DAO to a user rating DTO.
 * @param {IUserRatingDao} userRatingDao the user rating to convert.
 * @returns {UserRatingDto} the converted user rating.
 */
export const convertUserRatingDaoToDto = async (
  userRatingDao: IUserRatingDao,
): Promise<UserRatingDto> => {
  const author: IUserDao = await getUserByUserId(
    new mongoose.Types.ObjectId(userRatingDao.authorId.toString()),
    true,
  )

  const userRatingDto: UserRatingDto = {
    ratedUserId: userRatingDao.ratedUserId.toString(),
    id: userRatingDao._id.toString(),
    stars: userRatingDao.stars,
    text: userRatingDao.text,
    time: userRatingDao.time.toISOString(),
    authorId: userRatingDao.authorId.toString(),
    authorName: author.name,
    authorPicture: author.picture ? { url: author.picture } : undefined,
  }

  return userRatingDto
}

/**
 * Converts a item rating DAO to a item rating DTO.
 * @param {IItemRatingDao} itemRatingDao the item rating to convert.
 * @returns {ItemRatingDto} the converted item rating.
 */
export const convertItemRatingDaoToDto = async (
  itemRatingDao: IItemRatingDao,
): Promise<ItemRatingDto> => {
  const author: IUserDao = await getUserByUserId(
    new mongoose.Types.ObjectId(itemRatingDao.authorId.toString()),
    true,
  )

  const itemRatingDto: ItemRatingDto = {
    ratedItemId: itemRatingDao.ratedItemId.toString(),
    id: itemRatingDao._id.toString(),
    stars: itemRatingDao.stars,
    text: itemRatingDao.text,
    time: itemRatingDao.time.toISOString(),
    authorId: itemRatingDao.authorId.toString(),
    authorName: author.name,
    authorPicture: author.picture ? { url: author.picture } : undefined,
  }

  return itemRatingDto
}
