import {
  AddressDto,
  CategoryEnum,
  ItemDto,
  ItemMetaDataDto,
} from '@api/generated'
import { AddressDaoService, IAddressDao } from 'src/models/AddressDao'
import { CategoryEnumDao, IItemDao } from 'src/models/ItemDao'
import { IUserDao } from 'src/models/UserDao'
import { ApiError, ApiErrorCodes } from 'src/middleware/errorhandler/APIError'
import { convertAddressDaoToDto } from './addressConverterService'
import { convertAggregatedRatingDaoToDto } from './ratingConverterService'
import { convertAvailabilityDaoToDto } from './availabilityConverterService'
import { getUserByUserId } from '../userService'

/**
 * Converts a category enum DTO to a category enum DAO.
 * @param {CategoryEnum} categoryEnum the category enum to convert.
 * @throws {ApiError} if the category enum is invalid.
 * @returns {CategoryEnumDao} the converted category enum.
 */
export const convertItemCategoryEnumDtoToDao = (
  categoryEnum: CategoryEnum,
): CategoryEnumDao => {
  switch (categoryEnum) {
    case CategoryEnum.TOOLS:
      return CategoryEnumDao.TOOLS
    case CategoryEnum.ELECTRONICS:
      return CategoryEnumDao.ELECTRONICS
    case CategoryEnum.GARDEN:
      return CategoryEnumDao.GARDEN
    case CategoryEnum.CLEANING:
      return CategoryEnumDao.CLEANING
    case CategoryEnum.COOKING:
      return CategoryEnumDao.COOKING
    case CategoryEnum.CLOTHING:
      return CategoryEnumDao.CLOTHING
    case CategoryEnum.ACCESSORIES:
      return CategoryEnumDao.ACCESSORIES
    case CategoryEnum.MUSIC:
      return CategoryEnumDao.MUSIC
    case CategoryEnum.OTHER:
      return CategoryEnumDao.OTHER
    default:
      throw new ApiError(
        ApiErrorCodes.BAD_REQUEST,
        `Invalid category of ${categoryEnum}.`,
      )
  }
}

/**
 * Converts a category enum DAO to a category enum DTO.
 * @param {CategoryEnumDao} categoryEnumDao the category enum to convert.
 * @throws {ApiError} if the category enum is invalid.
 * @returns {CategoryEnum} the converted category enum.
 */
export const convertItemCategoryEnumDaoToDto = (
  categoryEnumDao: CategoryEnumDao,
): CategoryEnum => {
  switch (categoryEnumDao) {
    case CategoryEnumDao.TOOLS:
      return CategoryEnum.TOOLS
    case CategoryEnumDao.ELECTRONICS:
      return CategoryEnum.ELECTRONICS
    case CategoryEnumDao.GARDEN:
      return CategoryEnum.GARDEN
    case CategoryEnumDao.CLEANING:
      return CategoryEnum.CLEANING
    case CategoryEnumDao.COOKING:
      return CategoryEnum.COOKING
    case CategoryEnumDao.CLOTHING:
      return CategoryEnum.CLOTHING
    case CategoryEnumDao.ACCESSORIES:
      return CategoryEnum.ACCESSORIES
    case CategoryEnumDao.MUSIC:
      return CategoryEnum.MUSIC
    case CategoryEnumDao.OTHER:
      return CategoryEnum.OTHER
    default:
      throw new ApiError(
        ApiErrorCodes.INTERNAL_SERVER_ERROR,
        `Invalid category of ${categoryEnumDao}.`,
      )
  }
}

/**
 * Converts an item DAO to an item DTO.
 * @param {IItemDao} itemDao the item DAO to convert.
 * @throws {ApiError} if the item DAO foreign references are invalid.
 * @returns {Promise<ItemMetaDataDto>} the converted item DTO.
 */
export const convertItemDaoToItemMetaDataDto = async (
  itemDao: IItemDao,
): Promise<ItemMetaDataDto> => {
  const lender: IUserDao = await getUserByUserId(itemDao.lenderId, true)
  const itemAddress: IAddressDao | null = await AddressDaoService.findById(
    itemDao?.addressId,
  )
  if (!itemAddress) {
    throw new ApiError(
      ApiErrorCodes.NOT_FOUND,
      `Item address with id ${itemDao.addressId.toString()} not found.`,
    )
  }

  const addressDto: AddressDto = convertAddressDaoToDto(itemAddress)

  const itemMetaDataDto: ItemMetaDataDto = {
    id: itemDao._id.toString(),
    title: itemDao.title,
    avgRating: convertAggregatedRatingDaoToDto(itemDao.avgRating),
    priceFirstDay: itemDao.priceFirstDay,
    pricePerDay: itemDao.priceNextDays,
    picture: {
      url: itemDao.pictures[0],
    },
    lenderName: lender.name,
    lenderPicture: lender.picture
      ? {
          url: lender?.picture,
        }
      : undefined,
    location: addressDto,
  }
  return itemMetaDataDto
}

/**
 * Converts an ItemDao object to an ItemDto object.
 * @param {ItemDao} itemDao The ItemDao object to convert.
 * @throws {ApiError} if the address is not found.
 * @returns {Promise<ItemDto>} The converted ItemDto object.
 */
export const convertItemDaoToItemDto = async (
  itemDao: IItemDao,
): Promise<ItemDto> => {
  const address: IAddressDao | null = await AddressDaoService.findById(
    itemDao.addressId,
  )

  if (!address) {
    throw new ApiError(
      ApiErrorCodes.NOT_FOUND,
      `Address with id ${itemDao.addressId.toString()} for item ${itemDao._id.toString()} not found.`,
    )
  }

  const itemDto: ItemDto = {
    id: itemDao._id.toString(),
    title: itemDao.title,
    description: itemDao.description,
    priceFirstDay: itemDao.priceFirstDay,
    pricePerDay: itemDao.priceNextDays,
    availability: convertAvailabilityDaoToDto(itemDao.availability),
    pictures: itemDao.pictures.map(picture => ({ url: picture })),
    avgRating: convertAggregatedRatingDaoToDto(itemDao.avgRating),
    insuranceReq: itemDao.insuranceReq,
    categories: itemDao.categories.map(category =>
      convertItemCategoryEnumDaoToDto(category),
    ),
    featuredUntil: itemDao.featuredUntil?.toISOString() || undefined,
    lenderId: itemDao.lenderId.toString(),
    address: convertAddressDaoToDto(address),
  }
  return itemDto
}
