import { AddressDto } from '@api/generated'
import mongoose from 'mongoose'
import { AddressDaoService, IAddressDao } from 'src/models/AddressDao'
import { ItemDaoService } from 'src/models/ItemDao'
import { ApiError, ApiErrorCodes } from 'src/middleware/errorhandler/APIError'
// eslint-disable-next-line import/no-cycle
import { getUserByUserId } from './userService'

/**
 * Add an address.
 * @param {AddressDto} address the address to add
 * @throws {ApiError} If the address could not be created.
 * @returns {Promise<IAddressDao>} the created address
 */
export const createNewAddress = async (
  address: AddressDto,
): Promise<IAddressDao> => {
  // TODO google api lang longitude
  const newAddress = await AddressDaoService.create({
    street: address.street,
    city: address.city,
    zipCode: address.zipCode,
    latitude: address.latitude,
    longitude: address.longitude,
  })
  if (!newAddress) {
    throw new ApiError(
      ApiErrorCodes.INTERNAL_SERVER_ERROR,
      'Could not create new address.',
    )
  }
  return newAddress
}

/**
 * Retrieve an address by its id.
 * @param {ObjectId} userId the id of the user
 * @param {ObjectId} addressId the id of the address
 * @throws {ApiError} If the user or the address is not found or they do not belong to each other.
 * @returns {Promise<IAddressDao>} the address
 */
export const getAddressByUserIdAddressId = async (
  userId: mongoose.Types.ObjectId,
  addressId: mongoose.Types.ObjectId,
): Promise<IAddressDao> => {
  const user = await getUserByUserId(userId)
  if (
    user.addressIds.map(aId => aId.toString()).indexOf(addressId.toString()) ===
    -1
  ) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `Address with id ${addressId.toString()} does not belong to user with id ${userId.toString()}`,
    )
  }
  const address = await AddressDaoService.findById(addressId)
  if (!address) {
    throw new ApiError(
      ApiErrorCodes.NOT_FOUND,
      `Address with id ${addressId.toString()} not found.`,
    )
  }
  return address
}

/**
 * Retrieve all addresses of a user by its id.
 * @param {ObjectId} userId the id of the user
 * @throws {ApiError} If the user is not found.
 * @returns {Promise<IAddressDao[]>} all addresses of a user
 */
export const getAllAddressesByUserId = async (
  userId: mongoose.Types.ObjectId,
): Promise<IAddressDao[]> => {
  const user = await getUserByUserId(userId)
  const addresses: IAddressDao[] = await AddressDaoService.find({
    _id: { $in: user.addressIds },
  })
  return addresses
}

/**
 * Add an address to a user by its id.
 * @param {ObjectId} userId the id of the user
 * @param address the address to add
 * @throws {ApiError} If the user is not found.
 * @returns {Promise<IAddressDao>} the added address
 */
export const addAddressForUser = async (
  userId: mongoose.Types.ObjectId,
  address: AddressDto,
): Promise<IAddressDao> => {
  const user = await getUserByUserId(userId)

  // TODO GOOGLE API CALL TO GET LAT AND LNG
  const newAddress = await createNewAddress(address)
  user.addressIds.push(newAddress._id)
  await user.save()
  return newAddress
}

/**
 * Update an address of a user by its id.
 * @param {ObjectId} userId the id of the user
 * @param {ObjectId} addressId the id of the address
 * @param {AddressDto} address the address to update
 * @throws {ApiError} If the user or address is not found or if they do not belong to each other.
 * @returns {Promise<IAddressDao>} the updated address
 */
export const updateAddressForUser = async (
  userId: mongoose.Types.ObjectId,
  addressId: mongoose.Types.ObjectId,
  address: AddressDto,
): Promise<IAddressDao> => {
  const addressDao = await getAddressByUserIdAddressId(userId, addressId)

  addressDao.street = address.street
  addressDao.city = address.city
  addressDao.zipCode = address.zipCode
  addressDao.latitude = address.latitude
  addressDao.longitude = address.longitude

  return addressDao.save()
}

/**
 * Delete an address of a user by its id.
 * @param {ObjectId} userId the id of the user
 * @param {ObjectId} addressId the id of the address
 * @throws {ApiError} If the user or address is not found or if the address is still in use.
 */
export const deleteAddressForUserByAddressId = async (
  userId: mongoose.Types.ObjectId,
  addressId: mongoose.Types.ObjectId,
): Promise<void> => {
  const user = await getUserByUserId(userId)
  const addressDao = await getAddressByUserIdAddressId(userId, addressId)

  const items = await ItemDaoService.find({
    addressId,
    lenderId: userId,
  })
  if (items) {
    throw new ApiError(
      ApiErrorCodes.CONFLICT,
      `Cannot delete address because it is used by items ${items.map(i =>
        i._id.toString(),
      )}.`,
    )
  }

  if (user.addressIds[0].toString() === addressId.toString()) {
    throw new ApiError(
      ApiErrorCodes.CONFLICT,
      `Cannot delete address with id ${addressId.toString()} because it is the main address of user ${userId.toString()}.`,
    )
  }

  user.addressIds = user.addressIds.filter(
    userAddressId => userAddressId.toString() !== addressId.toString(),
  )

  await addressDao.deleteOne()
  await user.save()
}
