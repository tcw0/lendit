/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import {
  ItemMetaDataDto,
  CategoryEnum,
  ItemDto,
  RentalDto,
  ItemRatingDto,
  AvailabilityDto,
  UserMetaDataDto,
  NewItemDto,
  NewFeaturedDto,
} from '@api/generated'
import {
  convertItemDaoToItemDto,
  convertItemDaoToItemMetaDataDto,
} from 'src/services/converters/itemConverterService'
import mongoose from 'mongoose'
import { IItemDao } from 'src/models/ItemDao'
import { convertRentalDaoToDto } from 'src/services/converters/rentalConverterService'
import { getAllItemRatingsForItem } from 'src/services/ratingService'
import { convertItemRatingDaoToDto } from 'src/services/converters/ratingConverterService'
import {
  convertAvailabilityDaoToDto,
  convertAvailabilityDtoToDao,
} from 'src/services/converters/availabilityConverterService'
import { getUserByUserId } from 'src/services/userService'
import { convertUserDaoToUserMetaDataDto } from 'src/services/converters/userDtoConverter'
import {
  addFeaturedToItemById,
  getFeaturedPrice,
} from 'src/services/featuredService'
import { payWithPaymentByIdAndUserIdAndAmount } from 'src/services/paymentService'
import {
  createItem,
  searchItemMetaData,
  deleteItemById,
  updateItemById,
  getItemById,
  getFeaturedItem,
  getRentals,
  getItemByIdWithWriteCheck,
} from '../services/itemService'

/**
 * Add a new item.
 * @param {Request<any, any, NewItemDto>} req the incoming request including the item to add.
 * @param {Response<ItemDto>} res the outgoing response including the newly added item.
 */
export const postItem = async (
  req: Request<any, any, NewItemDto>,
  res: Response<ItemDto>,
) => {
  const { session } = res.locals

  const newItem = await createItem(req.body, session.id)
  const itemDto = await convertItemDaoToItemDto(newItem)

  res.status(200).json(itemDto)
}

/**
 * Get a item by ID.
 * @param {Request<{ itemId: string }>} req The incoming request including the item ID.
 * @param {Response<ItemDto>} res The outgoing response including the Item.
 */
export const getById = async (
  req: Request<{ itemId: string }>,
  res: Response<ItemDto>,
) => {
  const { itemId } = req.params

  const id = new mongoose.Types.ObjectId(itemId)
  const item = await getItemById(id)
  const itemDto = await convertItemDaoToItemDto(item)

  res.status(200).json(itemDto)
}

/**
 * Search for items based on parameters.
 * @param {Request} req the incoming request including the search parameters.
 * @param {Response<ItemMetaDataDto[]>} res the outgoing response including the search results as item metadata.
 */
export const searchItem = async (
  req: Request<
    any,
    any,
    {
      term?: string
      category?: CategoryEnum
      priceFrom?: number
      priceTo?: number
      availabilityFrom?: string
      availabilityTo?: string
      latitude?: number
      longitude?: number
      featured?: boolean
      distance?: number
    }
  >,
  res: Response<ItemMetaDataDto[]>,
) => {
  const {
    term,
    category,
    priceFrom,
    priceTo,
    availabilityFrom,
    availabilityTo,
    latitude,
    longitude,
    featured,
    distance,
  } = req.query

  const items = await searchItemMetaData(
    String(term),
    category as CategoryEnum,
    Number(priceFrom),
    Number(priceTo),
    availabilityFrom ? String(availabilityFrom) : undefined,
    availabilityTo ? String(availabilityTo) : undefined,
    Number(latitude),
    Number(longitude),
    featured ? (JSON.parse(featured as string) as boolean) : undefined,
    Number(distance),
  )

  res.status(200).json(items)
}

/**
 * Update an item by its ID.
 * @param {Request<{ itemId: ObjectId }, ItemDto>} req The incoming request including the item ID and the new item data.
 * @param {Response<ItemDto>} res The outgoing response including the updated item.
 */
export const putItemById = async (
  req: Request<{ itemId: mongoose.Types.ObjectId }, ItemDto>,
  res: Response<ItemDto>,
) => {
  const { session } = res.locals
  const { itemId } = req.params

  const updatedItem = await updateItemById(session.id, itemId, req.body)
  const updatedItemDto = await convertItemDaoToItemDto(updatedItem)

  res.status(200).json(updatedItemDto)
}

/**
 * Delete an item by its ID.
 * @param {Request<{ itemId: ObjectId }>} req The incoming request including the item ID.
 * @param {Response} res The outgoing response.
 */
export const deleteItem = async (
  req: Request<{ itemId: mongoose.Types.ObjectId }>,
  res: Response,
) => {
  const { session } = res.locals
  const { itemId } = req.params

  await deleteItemById(itemId, session.id)

  res.status(204).send()
}

/**
 * Get the metadata for a specific item by its ID.
 * @param {Request<{ itemId: mongoose.Types.ObjectId }>} req the incoming request including the item ID.
 * @param {Response<ItemMetaDataDto>} res the outgoing response including the item metadata.
 */
export const getItemsByIdMetadata = async (
  req: Request<{ itemId: mongoose.Types.ObjectId }>,
  res: Response<ItemMetaDataDto>,
) => {
  const { itemId } = req.params

  const item = await getItemById(itemId)
  const itemMetaDataDto = await convertItemDaoToItemMetaDataDto(item)

  res.status(200).json(itemMetaDataDto)
}

/**
 * Get the availability for an item by its ID.
 * @param {Request<{ itemId: string }>} req The incoming request including the item ID.
 * @param {Response<ItemAvailabilityDto>} res The outgoing response including the availability for the item.
 */
export const getItemsByItemIdAvailability = async (
  req: Request<{ itemId: mongoose.Types.ObjectId }>,
  res: Response<AvailabilityDto>,
) => {
  const { itemId } = req.params

  const item = await getItemById(itemId)
  const availabilityDto = convertAvailabilityDaoToDto(item.availability)

  res.status(200).json(availabilityDto)
}

/**
 * Post the availability for an item by its ID.
 * @param {Request<{ itemId: mongoose.Types.ObjectId }, AvailabilityDto>} req the incoming request including the item ID and the new availability.
 * @param {Response<AvailabilityDto>} res the outgoing response including the newly added availability.
 */
export const postItemsByItemIdAvailability = async (
  req: Request<{ itemId: mongoose.Types.ObjectId }, AvailabilityDto>,
  res: Response<AvailabilityDto>,
) => {
  const { itemId } = req.params
  const { session } = res.locals

  const item = await getItemByIdWithWriteCheck(itemId, session.id)
  item.availability = convertAvailabilityDtoToDao(req.body)
  await item.save()
  const availabilityDto = convertAvailabilityDaoToDto(item.availability)

  res.status(200).json(availabilityDto)
}

/**
 * Get all rentals for an item by its ID.
 * @param {Request<{ itemId: string }>} req The incoming request including the item ID.
 * @param {Response<RentalDto[]>} res The outgoing response including the rentals for the item.
 */
export const getItemRentals = async (
  req: Request<{ itemId: mongoose.Types.ObjectId }>,
  res: Response<RentalDto[]>,
) => {
  const { session } = res.locals
  const { itemId } = req.params

  const rentals = await getRentals(itemId, session.id)
  const rentalsDto = await Promise.all(
    rentals.map(rental => convertRentalDaoToDto(rental)),
  )

  res.status(200).json(rentalsDto)
}

/**
 * Get all featured items for a category
 * @param {Request<{ itemId: string }>} req The incoming request including the category.
 * @param {Response<ItemMetaDataDto[]>} res The outgoing response including the items.
 */
export const featuredItems = async (
  req: Request<{ category: CategoryEnum }>,
  res: Response<ItemMetaDataDto[]>,
) => {
  const { category } = req.query

  const receivedFeaturedItems: IItemDao[] = await getFeaturedItem(
    category as CategoryEnum,
  )
  const convertedItems: ItemMetaDataDto[] = await Promise.all(
    receivedFeaturedItems.map(item => convertItemDaoToItemMetaDataDto(item)),
  )

  res.status(200).json(convertedItems)
}

/**
 * Get all ratings for an item by its ID.
 * @param {Request<{ itemId: string }>} req The incoming request including the item ID.
 * @param {Response<ItemRatingDto[]>} res The outgoing response including the ratings of the item.
 */
export const getAllItemRatings = async (
  req: Request<{ itemId: mongoose.Types.ObjectId }>,
  res: Response<ItemRatingDto[]>,
) => {
  const { itemId } = req.params
  const ratings = await getAllItemRatingsForItem(itemId)
  const ratingsDto = await Promise.all(
    ratings.map(rating => convertItemRatingDaoToDto(rating)),
  )

  res.status(200).json(ratingsDto)
}

/**
 * Get the metadata of the lender of an item by its ID.
 * @param {Request<{ itemId: mongoose.Types.ObjectId }>} req the incoming request including the item ID.
 * @param {Response<UserMetaDataDto>} res the outgoing response including the metadata of the lender.
 */
export const getItemsByItemIdUserLender = async (
  req: Request<{ itemId: mongoose.Types.ObjectId }>,
  res: Response<UserMetaDataDto>,
) => {
  const { itemId } = req.params

  const item = await getItemById(itemId)
  const user = await getUserByUserId(item.lenderId)
  const userDto = convertUserDaoToUserMetaDataDto(user)

  res.status(200).json(userDto)
}

/**
 * Mark an item as featured
 * @param {Request<{ itemId: string }, any, NewFeaturedDto>} req the incoming request including the item ID and the new feature information (payment and duration).
 * @param {Response} res the outgoing response about successfull featuring
 */
export const postItemByIdFeatured = async (
  req: Request<{ itemId: string }, any, NewFeaturedDto>,
  res: Response<ItemDto>,
) => {
  const { itemId } = req.params
  const { session } = res.locals

  await getItemByIdWithWriteCheck(
    new mongoose.Types.ObjectId(itemId),
    session.id,
  )
  await payWithPaymentByIdAndUserIdAndAmount(
    new mongoose.Types.ObjectId(req.body.paymentId),
    session.id,
    getFeaturedPrice(req.body.durationInDays),
  )
  const item: IItemDao = await addFeaturedToItemById(
    new mongoose.Types.ObjectId(itemId),
    req.body,
  )
  const itemDto: ItemDto = await convertItemDaoToItemDto(item)

  res.status(200).json(itemDto)
}
