import {
  CategoryEnum,
  ItemMetaDataDto,
  ItemDto,
  NewItemDto,
} from '@api/generated'
import mongoose from 'mongoose'
import { IItemDao, ItemDaoService } from 'src/models/ItemDao'
import { IRentalDao, RentalDaoService } from 'src/models/RentalDao'
import { WeekdayEnumDao } from 'src/models/AvailabilityDao'
import { IUserDao } from 'src/models/UserDao'
import { ApiError, ApiErrorCodes } from 'src/middleware/errorhandler/APIError'
import { AddressDaoService, IAddressDao } from 'src/models/AddressDao'
import { getDistance } from 'geolib'
import { addDays } from 'date-fns'
import {
  convertTimeSpanDtoToDao,
  convertWeekdayEnumDtoToDao,
} from './converters/availabilityConverterService'
import {
  convertItemCategoryEnumDtoToDao,
  convertItemDaoToItemMetaDataDto,
} from './converters/itemConverterService'
import { getAddressByUserIdAddressId } from './addressService'
import { getUserByUserId } from './userService'

/**
 * Creates a new item for the given user.
 * @param {NewItemDto} itemDto the item DTO to create.
 * @param {ObjectId} lenderId the ID of the lender owning the item.
 * @throws {ApiError} if the item could not be created.
 * @returns {Promise<IItemDao>} the created item DAO.
 */
export const createItem = async (
  itemDto: NewItemDto,
  lenderId: mongoose.Types.ObjectId,
): Promise<IItemDao> => {
  const lender: IUserDao = await getUserByUserId(lenderId)

  if (itemDto.addressId) {
    await getAddressByUserIdAddressId(
      lenderId,
      new mongoose.Types.ObjectId(itemDto.addressId.toString()),
    )
  }

  const newItem: IItemDao = await ItemDaoService.create({
    title: itemDto.title,
    description: itemDto.description,
    priceFirstDay: itemDto.priceFirstDay,
    priceNextDays: itemDto.pricePerDay,
    availability: {
      whitelist: itemDto.availability.whitelist.map(timeSpan =>
        convertTimeSpanDtoToDao(timeSpan),
      ),
      blacklist: itemDto.availability.blacklist.map(timeSpan =>
        convertTimeSpanDtoToDao(timeSpan),
      ),
      availableWeekdays: itemDto.availability.availableWeekdays.map(wd =>
        convertWeekdayEnumDtoToDao(wd),
      ),
    },
    pictures: itemDto.pictures.map(picture => picture.url),
    avgRating: {
      averageRating: 0,
      count: 0,
    },
    insuranceReq: itemDto.insuranceReq,
    categories: itemDto.categories.map(category =>
      convertItemCategoryEnumDtoToDao(category),
    ),
    lenderId,
    addressId: itemDto.addressId
      ? new mongoose.Types.ObjectId(itemDto.addressId.toString())
      : new mongoose.Types.ObjectId(lender.addressIds[0].toString()),
  })

  if (!newItem) {
    throw new ApiError(
      ApiErrorCodes.INTERNAL_SERVER_ERROR,
      'Could not create new item.',
    )
  }

  return newItem
}

/**
 * Validate for a specific day, if it is available for the given item.
 * @param {Date} day
 * @param {ItemDao} item
 * @returns {boolean}
 */
const validateDay = (day: Date, item: IItemDao) => {
  const { whitelist, blacklist, availableWeekdays } = item.availability

  // check if the selected date falls within any timespan in the blacklist
  if (blacklist) {
    if (
      blacklist.some(
        ({ start, end }) =>
          day >= new Date(start) && day <= addDays(new Date(end), 1),
      )
    ) {
      return false // disable dates within the blacklist
    }
  }

  // check if the selected date falls within any timespan in the whitelist
  if (whitelist) {
    if (
      whitelist.some(
        ({ start, end }) =>
          day >= new Date(start) && day <= addDays(new Date(end), 1),
      )
    ) {
      return true // enable dates within the blacklist
    }
  }

  // get the day of the week from the selected date
  const dayOfWeek = day.getDay()

  // convert the day of the week to our corresponding WeekdayEnum value
  const weekday = Object.values(WeekdayEnumDao)[(dayOfWeek + 6) % 7]

  // check if the weekday is included in the availableWeekdays array
  return availableWeekdays ? availableWeekdays.includes(weekday) : false
}

/**
 * Search for items based on parameters.
 * @param {string} term the search term.
 * @param {CategoryEnum} category the item category.
 * @param {number} priceFrom the minimum item price.
 * @param {number} priceTo the maximum item price.
 * @param {string} availabilityFrom the starting availability date.
 * @param {string} availabilityTo the ending availability date.
 * @param {Longitude} location the item location.
 * @param {Latitude} location the item location.
 * @param {boolean} featured whether to only include featured items.
 * @returns {Promise<ItemMetaDataDto[]>} the search results as item metadata.
 */
export const searchItemMetaData = async (
  searchString?: string,
  category?: CategoryEnum,
  priceFrom?: number,
  priceTo?: number,
  availabilityFrom?: string,
  availabilityTo?: string,
  latitude?: number,
  longitude?: number,
  featured?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  distance?: number,
): Promise<ItemMetaDataDto[]> => {
  // todo: locataion

  let query = ItemDaoService.find()

  query.find({ disabled: undefined })

  if (searchString) {
    // Perform fuzzy text search on the item title
    query = query.find({
      $or: [
        { title: { $regex: new RegExp(searchString, 'i') } },
        { description: { $regex: new RegExp(searchString, 'i') } },
      ],
    })
  }

  if (category) {
    // Filter by category
    query = query.find({ categories: { $in: [category] } })
  }

  if (priceFrom) {
    // Filter by minimum price
    query = query.where('priceFirstDay').gte(priceFrom)
  }

  if (priceTo) {
    // Filter by maximum price
    query = query.where('priceFirstDay').lte(priceTo)
  }

  if (featured) {
    const currentDate = new Date()

    // Filter by featured items
    query = query.where('featuredUntil').gte(currentDate.getTime())
  }

  let results = await query.exec()

  // Check for availability
  if (availabilityFrom !== undefined && availabilityTo !== undefined) {
    const fromDate = new Date(availabilityFrom)
    const toDate = new Date(availabilityTo)

    // Perform the availability check for each item
    results = results.filter(item => {
      const current = new Date(fromDate)

      while (current <= toDate) {
        if (!validateDay(current, item)) {
          return false
        }
        current.setDate(current.getDate() + 1)
      }

      return true
    })
  }

  // Apply location filter
  if (longitude && latitude && distance) {
    const filteredResults = await Promise.all(
      results.map(async item => {
        // Calculate the distance between the item's location and the specified coordinates
        const Itemaddress: IAddressDao | null =
          await AddressDaoService.findById(item.addressId)
        if (Itemaddress) {
          const itemDistance = getDistance(
            {
              latitude: Itemaddress.latitude,
              longitude: Itemaddress.longitude,
            },
            { latitude, longitude },
          )
          // Check if the calculated distance is within the threshold
          return itemDistance <= distance * 1000 // km to meter
        }
        return false
      }),
    )

    results = results.filter((_, index) => filteredResults[index])
  }

  const itemsMetadata = Promise.all(
    results.map(async i => convertItemDaoToItemMetaDataDto(i)),
  )

  return itemsMetadata
}

/**
 * Update an item by its ID.
 * @param {ObjectId} itemId The ID of the item.
 * @param {ItemDto} itemDto The updated item data.
 * @throws {ApiError} if the item could not be updated.
 * @returns {Promise<IItemDao>} The updated item.
 */
export const updateItemById = async (
  userId: mongoose.Types.ObjectId,
  itemId: mongoose.Types.ObjectId,
  itemDto: ItemDto,
): Promise<IItemDao> => {
  if (itemDto.lenderId !== userId.toString()) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `User ${userId.toString()} is not allowed to update item ${itemId.toString()} as it belongs to a different user.`,
    )
  }

  if (itemDto.address?.id) {
    await getAddressByUserIdAddressId(
      userId,
      new mongoose.Types.ObjectId(itemDto.address.id.toString()),
    )
  }

  const updatedItem: IItemDao | null = await ItemDaoService.findByIdAndUpdate(
    itemId,
    {
      title: itemDto.title,
      description: itemDto.description,
      priceFirstDay: itemDto.priceFirstDay,
      priceNextDays: itemDto.pricePerDay,
      availability: {
        whitelist: itemDto.availability.whitelist.map(timeSpan =>
          convertTimeSpanDtoToDao(timeSpan),
        ),
        blacklist: itemDto.availability.blacklist.map(timeSpan =>
          convertTimeSpanDtoToDao(timeSpan),
        ),
        availableWeekdays: itemDto.availability.availableWeekdays.map(wd =>
          convertWeekdayEnumDtoToDao(wd),
        ),
      },
      pictures: itemDto.pictures.map(picture => picture.url),
      avgRating: {
        averageRating: 0,
        count: 0,
      },
      insuranceReq: itemDto.insuranceReq,
      categories: itemDto.categories.map(category =>
        convertItemCategoryEnumDtoToDao(category),
      ),
      addressId: new mongoose.Types.ObjectId(itemDto.address?.id.toString()),
    },
    { new: true },
  )

  if (!updatedItem) {
    throw new ApiError(
      ApiErrorCodes.INTERNAL_SERVER_ERROR,
      `Could not update item with id ${itemId.toString()}`,
    )
  }

  return updatedItem
}

/**
 * Get an item by its ID.
 * @param {ObjectId} itemId the ID of the item.
 * @param {boolean} force if true, the item will be returned even if it is disabled.
 * @throws {ApiError} if the item could not be found.
 * @returns {Promise<IItemDao>} the item DAO.
 */
export const getItemById = async (
  itemId: mongoose.Types.ObjectId,
  force = false,
): Promise<IItemDao> => {
  const item: IItemDao | null = await ItemDaoService.findById(itemId)
  if (!item || (!force && item.disabled)) {
    throw new ApiError(
      ApiErrorCodes.NOT_FOUND,
      `Could not find item with id ${itemId.toString()}`,
    )
  }

  return item
}

export const getItemByIdWithWriteCheck = async (
  itemId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
): Promise<IItemDao> => {
  const item = await getItemById(itemId)
  if (item.lenderId.toString() !== userId.toString()) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `User ${userId.toString()} is not allowed to modify item ${itemId.toString()} as it belongs to a different user.`,
    )
  }
  return item
}

/**
 * Delete an item by its ID.
 * @param {ObjectId} itemId The ID of the item.
 * @returns {Promise<void>}
 */
export const deleteItemById = async (
  itemId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
): Promise<void> => {
  const item = await getItemById(itemId)

  if (item.lenderId.toString() !== userId.toString()) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `User ${userId.toString()} is not allowed to delete item ${itemId.toString()} as it belongs to a different user.`,
    )
  }

  item.disabled = true
  await item.save()
}

/**
 * Get an item by its ID.
 * @param {ObjectId} itemId the ID of the item.
 * @throws {ApiError} if items could not be found.
 * @returns {Promise<IItemDao[]>} the item DAOs.
 */
export const getFeaturedItem = async (
  category: CategoryEnum,
): Promise<IItemDao[]> => {
  const item: IItemDao[] = await ItemDaoService.find({
    categories: { $in: [category] },
    featuredUntil: { $gte: new Date() },
    disabled: undefined,
  })

  return item
}

/**
 * Find all rentals  of an item by its ID.
 * @param {ObjectId} itemId The ID of the item.
 * @throws {ApiError} if the rentals could not be found.
 * @returns {Promise<RentalDao[]>} The rentals.
 */
export const getRentals = async (
  itemId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
): Promise<IRentalDao[]> => {
  if ((await getItemById(itemId)).lenderId.toString() !== userId.toString()) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `User ${userId.toString()} is not allowed to retreive rentals for item ${itemId.toString()} as it belongs to a different user.`,
    )
  }

  const rentals = await RentalDaoService.find({ itemId })

  return rentals
}
