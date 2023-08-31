import bcrypt from 'bcrypt'
import {
  NewPaymentMethodDto,
  NewUserDto,
  PaymentMethodDto,
  UserDto,
  UserMetaDataDto,
} from '@api/generated'
import { IItemDao, ItemDaoService } from 'src/models/ItemDao'
import { IUserRatingDao, UserRatingDaoService } from 'src/models/UserRatingDao'
import mongoose from 'mongoose'
import { ApiError, ApiErrorCodes } from 'src/middleware/errorhandler/APIError'
import {
  IPaymentMethodDao,
  PaymentMethodDao,
} from 'src/models/PaymentMethodDao'
import { EncodeResult, encodeSession } from '../middleware/authentication/jwt'
import env from '../config/env'
import { UserDaoService, IUserDao, UserStateEnumDao } from '../models/UserDao'
import { IAddressDao } from '../models/AddressDao'
// eslint-disable-next-line import/no-cycle
import { convertUserDaoToUserMetaDataDto } from './converters/userDtoConverter'
// eslint-disable-next-line import/no-cycle
import { createNewAddress } from './addressService'
import { convertPaymentMethodDaoToDto } from './converters/paymentConverterService'

/**
 * Creates a new user with hash encrypted password.
 * @param {NewUserDto} userDto the user to create.
 * @returns {IUserDao} the created user.
 */
export const createNewUser = async (
  newUserDto: NewUserDto,
): Promise<IUserDao> => {
  // Create Salt to ensure same passwords don't have the same hash value
  const salt = await bcrypt.genSalt()
  // Hash password including salt
  const hash = await bcrypt.hash(newUserDto.password, salt)

  if (await UserDaoService.findOne({ email: newUserDto.email })) {
    throw new ApiError(
      ApiErrorCodes.BAD_REQUEST,
      'User with this email already exists.',
    )
  }

  const newAddress: IAddressDao = await createNewAddress(newUserDto.address)

  const newUser = await UserDaoService.create({
    name: newUserDto.name,
    email: newUserDto.email,
    description: '',
    picture: undefined,
    registeredSince: new Date(),
    avgRating: {
      averageRating: 0,
      count: 0,
    },
    addressIds: [newAddress._id],
    password: hash,
    paymentMethods: [],
    userState: UserStateEnumDao.NOT_VERIFIED,
  })

  if (!newUser) {
    throw new ApiError(
      ApiErrorCodes.INTERNAL_SERVER_ERROR,
      'Error creating new user.',
    )
  }

  return newUser
}

/**
 * Get a user by ID.
 * @param {ObjectId} userId The ID of the user to retrieve.
 * @throws {ApiError} If the user is not found.
 * @returns {Promise<IUserDao>} The user object.
 */
export const getUserByUserId = async (
  userId: mongoose.Types.ObjectId,
  force = false,
): Promise<IUserDao> => {
  // Logic to retrieve a user by its ID from the database
  const user: IUserDao | null = await UserDaoService.findById(userId)
  if (!user || (!force && user.disabled)) {
    throw new ApiError(
      ApiErrorCodes.NOT_FOUND,
      `User with id ${userId.toString()} not found.`,
    )
  }
  return user
}

/**
 * Update a user by ID.
 * @param {ObjectId} userId The ID of the user to update.
 * @param {UserDao} updatedUser The updated user object.
 * @throws {ApiError} If the user is not found.
 * @returns {Promise<IUserDao>} The updated user object.
 */
export const updateById = async (
  userId: mongoose.Types.ObjectId,
  updatedUser: UserDto,
): Promise<IUserDao> => {
  // Logic to update a user by its ID in the database
  const user: IUserDao = await getUserByUserId(userId)
  user.name = updatedUser.name
  user.description = updatedUser.description
  user.picture = updatedUser.picture?.url
  return user.save()
}

/**
 * Delete a user by ID.
 * @param {ObjectId} userId The ID of the user to delete.
 * @throws {ApiError} If the user is not found.
 */
export const deleteById = async (
  userId: mongoose.Types.ObjectId,
): Promise<void> => {
  // Logic to delete a user by its ID from the database
  const toDeleteUser: IUserDao = await getUserByUserId(userId)
  toDeleteUser.disabled = true
  await toDeleteUser.save()

  // disable all user Items
  const items: IItemDao[] = await ItemDaoService.find({
    lenderId: userId,
  })
  items.forEach(async item => {
    // eslint-disable-next-line no-param-reassign
    item.disabled = true
    await item.save()
  })
}

/**
 * Get all items of a user.
 * @param {ObjectId} userId The ID of the user.
 * @returns {Promise<IItemDao[]>} The items information.
 */
export const getItemsForUser = async (
  userId: mongoose.Types.ObjectId,
): Promise<IItemDao[]> => {
  const items: IItemDao[] = await ItemDaoService.find({
    lenderId: userId,
    disabled: undefined,
  })
  return items
}

/**
 * Get all ratings of a user.
 * @param {ObjectId} userId The ID of the user.
 * @returns {Promise<IUserRatingDao[]>} The array of user ratings.
 */
export const getAllRatings = async (
  userId: mongoose.Types.ObjectId,
): Promise<IUserRatingDao[]> => {
  const ratings: IUserRatingDao[] = await UserRatingDaoService.find({
    ratedUserId: userId,
  })
  return ratings
}

/**
 * Login a user.
 * @param {string} email The email of the user.
 * @param {string} password The password of the user.
 * @returns {Promise<EncodeResult>} The encoded session result.
 * @throws {ApiError} If the email or password is incorrect.
 */
export const login = async (
  email: string,
  password: string,
): Promise<{ userMetadata: UserMetaDataDto; token: EncodeResult }> => {
  const user = await UserDaoService.findOne({ email })

  if (!user) {
    throw new ApiError(
      ApiErrorCodes.UNAUTHORIZED,
      `Invalid username or password. Please try again.`,
    )
  }

  if (user.disabled) {
    throw new ApiError(
      ApiErrorCodes.UNAUTHORIZED,
      `This account has been disabled. Please contact us to reactivate it.`,
    )
  }

  const userMetadata = convertUserDaoToUserMetaDataDto(user)

  if (await bcrypt.compare(password, user.password)) {
    const token: EncodeResult = encodeSession(env.SECRET_KEY ?? '', {
      id: user.id,
      username: email,
      dateCreated: new Date().getTime(),
    })
    return { userMetadata, token }
  }
  throw new ApiError(
    ApiErrorCodes.UNAUTHORIZED,
    `Invalid username or password. Please try again.`,
  )
}

export const pictureUpload = async (pictureData: File) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (pictureData as any).location
}
/**
 * Get user payment methods by user ID.
 * @param {ObjectId} userId The ID of the user.
 * @returns {Promise<PaymentMethodDto[]>} The user's payment methods.
 */
export const getPaymentMethods = async (
  userId: mongoose.Types.ObjectId,
): Promise<PaymentMethodDto[]> => {
  const user: IUserDao = await getUserByUserId(userId)

  const { paymentMethods } = user
  const paymentMethodsDto = paymentMethods.map(payment =>
    convertPaymentMethodDaoToDto(payment),
  )
  return paymentMethodsDto
}

/**
 * Add a new payment method for a user.
 * @param {ObjectId} userId The ID of the user.
 * @param {NewPaymentMethodDto} paymentMethodDto The payment method to add.
 * @returns {Promise<PaymentMethodDto>} The newly added payment method.
 */
export const addUserPaymentMethod = async (
  userId: mongoose.Types.ObjectId,
  paymentMethodDto: NewPaymentMethodDto,
): Promise<IPaymentMethodDao> => {
  const paymentMethod: IPaymentMethodDao = await PaymentMethodDao.create({
    creditCardNumber: paymentMethodDto.creditCardNumber,
    creditCardExpiryDate: paymentMethodDto.creditCardExpiryDate,
    creditCardOwner: paymentMethodDto.creditCardOwner,
    stripeId: paymentMethodDto.stripeId,
  })

  if (!paymentMethod) {
    throw new ApiError(
      ApiErrorCodes.INTERNAL_SERVER_ERROR,
      `Error saving new payment method.`,
    )
  }

  const user: IUserDao = await getUserByUserId(userId)
  user.paymentMethods.push(paymentMethod)
  await user.save()

  return paymentMethod
}

/**
 * Delete a paymentMethod by ID.
 * @param {ObjectId} userId The ID of the user to delete.
 * @throws {ApiError} If the user is not found.
 */
export const deletePaymentMethodById = async (
  userId: mongoose.Types.ObjectId,
  paymentMethodID: mongoose.Types.ObjectId,
): Promise<void> => {
  // Logic to delete a user by its ID from the database
  const user: IUserDao = await getUserByUserId(userId)

  // Find the index of the payment method with the given ID
  const paymentMethodIndex = user.paymentMethods.findIndex(
    (method: IPaymentMethodDao) =>
      method._id.toString() === paymentMethodID.toString(),
  )
  if (paymentMethodIndex === -1) {
    throw new ApiError(
      ApiErrorCodes.NOT_FOUND,
      `Payment method with ID ${paymentMethodID.toString()} not found.`,
    )
  }
  user.paymentMethods.splice(paymentMethodIndex, 1)
  await user.save()
}

/**
 * Get (derive) the verification ID for a user.
 * @param {ObjectId} userId the ID of the user.
 * @returns {Promise<string>} the verification ID.
 */
export const getVerificationIdForUser = async (
  userId: mongoose.Types.ObjectId,
): Promise<string> => {
  const user: IUserDao = await getUserByUserId(userId)
  const emailEncoding = Array.from(user.email).reduce(
    (prev, curr) => prev + curr.charCodeAt(0),
    0,
  )
  return `${emailEncoding}-${userId.toString().substring(2, 7)}`
}

/**
 * Update the password of a user.
 * @param {ObjectId} userId id of the user
 * @param {string} password the current password of the user
 * @param {string} newPassword the new password of the user
 * @throws {ApiError} If the old password is wrong.
 */
export const updateUserPassword = async (
  userId: mongoose.Types.ObjectId,
  password: string,
  newPassword: string,
): Promise<void> => {
  const user: IUserDao = await getUserByUserId(userId)

  if (await bcrypt.compare(password, user.password)) {
    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(newPassword, salt)
    user.password = hash
    await user.save()
  } else {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `Invalid username or password. Please try again.`,
    )
  }
}
