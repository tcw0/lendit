/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import {
  AddressDto,
  ItemMetaDataDto,
  NewPaymentMethodDto,
  NewUserDto,
  PaymentMethodDto,
  PictureDto,
  UserDto,
  UserMetaDataDto,
  UserRatingDto,
} from '@api/generated'
import mongoose from 'mongoose'
import { convertUserDaoToDto } from 'src/services/converters/userDtoConverter'
import { convertItemDaoToItemMetaDataDto } from 'src/services/converters/itemConverterService'
import { convertUserRatingDaoToDto } from 'src/services/converters/ratingConverterService'
import { convertAddressDaoToDto } from 'src/services/converters/addressConverterService'
import {
  addAddressForUser,
  deleteAddressForUserByAddressId,
  getAllAddressesByUserId,
  updateAddressForUser,
} from 'src/services/addressService'
import { ApiError, ApiErrorCodes } from 'src/middleware/errorhandler/APIError'
import { uploadImage } from 'src/services/pictureService'
import { convertPaymentMethodDaoToDto } from 'src/services/converters/paymentConverterService'
import {
  createPaymentIntentForUser,
  createStripePaymentMethodForUser,
  updatePaymentMethodByIdAndUser,
} from 'src/services/paymentService'
import { IUserDao, UserStateEnumDao } from 'src/models/UserDao'
import { sendVerificationEmail } from 'src/services/mailService'
import {
  createNewUser,
  deleteById,
  getAllRatings,
  getUserByUserId,
  getItemsForUser,
  login,
  updateById,
  getPaymentMethods,
  addUserPaymentMethod,
  deletePaymentMethodById,
  getVerificationIdForUser,
  updateUserPassword,
} from '../services/userService'

/**
 * Create a new user.
 * @param {Request<any, any, NewUserDto>} req The incoming request containing the new user data.
 * @param {Response} res The outgoing response.
 */
export const postUser = async (
  req: Request<any, any, NewUserDto>,
  res: Response,
) => {
  const userDao: IUserDao = await createNewUser(req.body)
  await sendVerificationEmail(userDao)

  res.status(201).send()
}

/**
 * Get a user by ID.
 * @param {Request<{ userId: string }>} req The incoming request including the user ID.
 * @param {Response<UserDto>} res The outgoing response including the user.
 */
export const getUserById = async (
  req: Request<{ userId: string }>,
  res: Response<UserDto>,
) => {
  const { userId } = req.params

  const id = new mongoose.Types.ObjectId(userId)
  const user = await getUserByUserId(id)
  const userDto = await convertUserDaoToDto(user)

  res.status(200).json(userDto)
}

/**
 * Update a user by ID.
 * @param {Request<{ userId: string }, UserDto>} req The incoming request including the user ID and the updated user data.
 * @param {Response<UserDto>} res The outgoing response including the updated user.
 */
export const putUserById = async (
  req: Request<{ userId: string }, UserDto>,
  res: Response<UserDto>,
) => {
  const { userId } = req.params
  const { session } = res.locals

  if (userId !== session.id) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `User ${session.id.toString()} is not allowed to update user ${userId.toString()}.`,
    )
  }
  const updatedUser = await updateById(
    new mongoose.Types.ObjectId(userId),
    req.body,
  )
  const updatedUserDto = await convertUserDaoToDto(updatedUser)

  res.status(200).json(updatedUserDto)
}

/**
 * Delete a user by ID.
 * @param {Request<{ userId: string }>} req The incoming request including the user ID.
 * @param {Response} res The outgoing response indicating the success of the deletion.
 */
export const deleteUserById = async (
  req: Request<{ userId: string }>,
  res: Response,
) => {
  const { userId } = req.params
  const { session } = res.locals

  if (userId !== session.id) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `User ${session.id.toString()} is not allowed to delete user ${userId.toString()}.`,
    )
  }
  await deleteById(new mongoose.Types.ObjectId(userId))

  res.status(204).end()
}

/**
 * Get all user items.
 * @param {Request<{ userId: string }>} req The incoming request including the user ID.
 * @param {Response<ItemMetaDataDto[]>} res The outgoing response including all items of the user.
 */
export const getUserByIdItems = async (
  req: Request<{ userId: string }>,
  res: Response<ItemMetaDataDto[]>,
) => {
  const { userId } = req.params

  const id = new mongoose.Types.ObjectId(userId)
  const items = await getItemsForUser(id)
  const metadataDto: ItemMetaDataDto[] = await Promise.all(
    items.map(item => convertItemDaoToItemMetaDataDto(item)),
  )
  res.status(200).json(metadataDto)
}

/**
 * Get all user ratings.
 * @param {Request<{ userId: string }>} req The incoming request including the user ID.
 * @param {Response<UserRatingDto[]>} res The outgoing response including all ratings of the user.
 */
export const getUserByIdRatings = async (
  req: Request<{ userId: string }>,
  res: Response<UserRatingDto[]>,
) => {
  const { userId } = req.params

  const id = new mongoose.Types.ObjectId(userId)
  const ratings = await getAllRatings(id)
  const ratingDtos: UserRatingDto[] = await Promise.all(
    ratings.map(urating => convertUserRatingDaoToDto(urating)),
  )

  res.status(200).json(ratingDtos)
}

/**
 * Login a user.
 * @param {Request<{ email: string; password: string }>} req the incoming request containing the login data.
 * @param {Response<string>} res the outgoing response containing the JWT token.
 */
export const postUserLogin = async (
  req: Request<{ email: string; password: string }>,
  res: Response<{ user: UserMetaDataDto; token: string; firstLogin?: boolean }>,
) => {
  const { email, password } = req.body

  const { userMetadata, token } = await login(email, password)
  const user = await getUserByUserId(
    new mongoose.Types.ObjectId(userMetadata.id),
  )
  if (user.userState === UserStateEnumDao.NOT_VERIFIED) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `User is not verified yet. Check your emails.`,
    )
  }
  const firstLogin = user.userState !== UserStateEnumDao.ACTIVE
  user.userState = UserStateEnumDao.ACTIVE
  await user.save()

  res.status(200).json({
    user: userMetadata,
    token: token.token,
    firstLogin,
  })
}

/**
 * Get all user addresses by user id.
 * @param {Request<{ userId: string }>} req The incoming request including the user ID.
 * @param {Response<AddressDto[]>} res The outgoing response including all addresses of the user.
 * @returns
 */
export const getUserByIdAddress = async (
  req: Request<{ userId: string }>,
  res: Response<AddressDto[]>,
) => {
  const { session } = res.locals
  const { userId } = req.params

  if (userId !== session.id) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `User ${session.id.toString()} is not allowed to access addresses of user ${userId.toString()}.`,
    )
  }
  const addresses = await getAllAddressesByUserId(
    new mongoose.Types.ObjectId(userId),
  )
  const addressesDto = addresses.map(address => convertAddressDaoToDto(address))

  res.status(200).json(addressesDto)
}

/**
 * Add a new address for a user.
 * @param {Request<{ userId: string }, AddressDto>} req the incoming request containing the new address data.
 * @param {Response<AddressDto>} res the outgoing response containing the new address.
 */
export const postUserByIdAddress = async (
  req: Request<{ userId: string }, any, AddressDto>,
  res: Response<AddressDto>,
) => {
  const { session } = res.locals
  const { userId } = req.params

  if (userId !== session.id) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `User ${session.id.toString()} is not allowed to add addresses for user ${userId.toString()}.`,
    )
  }
  const address = await addAddressForUser(
    new mongoose.Types.ObjectId(userId),
    req.body,
  )
  const addressDto = convertAddressDaoToDto(address)

  res.status(201).json(addressDto)
}

/**
 * Update an address for a user.
 * @param {Request<{ userId: string; addressId: string }, AddressDto>} req the incoming request containing the updated address data.
 * @param {Response<AddressDto>} res the outgoing response containing the updated address.
 */
export const putUserByIdAddressById = async (
  req: Request<{ userId: string; addressId: string }, any, AddressDto>,
  res: Response<AddressDto>,
) => {
  const { session } = res.locals
  const { userId, addressId } = req.params

  if (userId !== session.id) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `User ${session.id.toString()} is not allowed to modify addresses of user ${userId.toString()}.`,
    )
  }
  const address = await updateAddressForUser(
    new mongoose.Types.ObjectId(userId),
    new mongoose.Types.ObjectId(addressId),
    req.body,
  )
  const addressDto = convertAddressDaoToDto(address)

  res.status(200).json(addressDto)
}

/**
 * Delete an address for a user.
 * @param {Request<{ userId: string; addressId: string }>} req the incoming request containing the address id.
 * @param {Response} res the success response.
 */
export const deleteUserByIdAddressById = async (
  req: Request<{ userId: string; addressId: string }>,
  res: Response,
) => {
  const { session } = res.locals
  const { userId, addressId } = req.params

  if (userId !== session.id) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `User ${session.id.toString()} is not allowed to delete addresses of user ${userId.toString()}.`,
    )
  }
  await deleteAddressForUserByAddressId(
    new mongoose.Types.ObjectId(userId),
    new mongoose.Types.ObjectId(addressId),
  )

  res.status(204).end()
}

/**
 * Upload a new picture for a user.
 * @param {Request} req the incoming request containing the picture data.
 * @param {Response<PictureDto[]>} res the outgoing response containing the upload url.
 */
export const postUploadPicture = async (
  req: Request,
  res: Response<PictureDto[]>,
) => {
  if (req.files?.files) {
    const files = Array.isArray(req.files?.files)
      ? req.files?.files
      : [req.files?.files]
    const uploadedFileUrls = await Promise.all(
      files.map(async file => {
        if (file) {
          const url = await uploadImage(file)
          return url
        }
        return undefined
      }),
    )
    const result: PictureDto[] = uploadedFileUrls
      .map(url => ({ url }))
      .filter(image => image !== undefined) as PictureDto[]
    res.status(200).json(result)
  } else {
    throw new ApiError(ApiErrorCodes.BAD_REQUEST, 'Missing file')
  }
}

/**
 * Get user payment methods
 * @param {Request<{ userID: string }>} req The incoming request including the user ID.
 * @param {Response<PaymentMethodDto>} res The outgoing response including the payment methods.
 */
export const getUserByIdPayment = async (
  req: Request<{ userId: string }>,
  res: Response<PaymentMethodDto[]>,
) => {
  const { userId } = req.params

  const { session } = res.locals

  // check if user should be able to get paymentmethods
  if (userId === session.id) {
    const id = new mongoose.Types.ObjectId(userId)
    const paymentMethods = await getPaymentMethods(id)
    res.status(200).json(paymentMethods)
  } else {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `User ${session.id.toString()} is not allowed to get payment metods of user ${userId.toString()}.`,
    )
  }
}

/**
 * Add payment method
 * @param {Request<{ userId: string }, any, NewPaymentMethodDto>} req The incoming request including the user ID and the new payment method.
 * @param {Response<PaymentMethodDto>} res The outgoing response including the added payment method.
 */
export const postUserByIdPayment = async (
  req: Request<{ userId: string }, any, NewPaymentMethodDto>,
  res: Response<PaymentMethodDto>,
) => {
  const { userId } = req.params
  const { session } = res.locals

  if (userId !== session.id) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `User ${session.id.toString()} is not allowed to add payment method for user ${userId.toString()}.`,
    )
  }
  const addedPaymentMethod = await addUserPaymentMethod(
    new mongoose.Types.ObjectId(userId),
    req.body,
  )
  const addedPaymentDto = convertPaymentMethodDaoToDto(addedPaymentMethod)

  res.status(201).json(addedPaymentDto)
}

/**
 * Delete a payment metohd by ID.
 * @param {Request<{ userId: string, paymentMethodId: string }>} req The incoming request including the user ID and paymentMethodID.
 * @param {Response<any>} res The outgoing response indicating the success of the deletion.
 */
export const deleteUserByIdPaymentById = async (
  req: Request<{ userId: string; paymentMethodId: string }>,
  res: Response,
) => {
  const { userId, paymentMethodId } = req.params
  const { session } = res.locals

  if (userId !== session.id) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `User ${session.id.toString()} is not allowed to delete user ${userId.toString()}.`,
    )
  }
  await deletePaymentMethodById(
    new mongoose.Types.ObjectId(userId),
    new mongoose.Types.ObjectId(paymentMethodId),
  )

  res.status(204).end()
}

/**
 * Update a payment method by ID.
 * @param {Request<{ userId: string, paymentMethodId: string }, any, PaymentMethodDto>} req the incoming request containing the payment method id.
 * @param {Response<PaymentMethodDto>} res the outgoing response containing the updated payment method.
 */
export const putUserByIdPaymentById = async (
  req: Request<
    { userId: string; paymentMethodId: string },
    any,
    PaymentMethodDto
  >,
  res: Response<PaymentMethodDto>,
) => {
  const { userId, paymentMethodId } = req.params
  const { session } = res.locals

  if (userId !== session.id) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `User ${session.id.toString()} is not allowed to update payment method for user ${userId.toString()}.`,
    )
  }
  const updatedPaymentMethod = await updatePaymentMethodByIdAndUser(
    new mongoose.Types.ObjectId(paymentMethodId),
    new mongoose.Types.ObjectId(userId),
    req.body,
  )
  const updatedPaymentDto = convertPaymentMethodDaoToDto(updatedPaymentMethod)

  res.status(200).json(updatedPaymentDto)
}

/**
 * Get user addresses
 * @param {Request<{ userID: string }>} req The incoming request including the user ID.
 * @param {Response<AddressDto>} res The outgoing response including the addresses.
 * @returns {Promise<void>}
 */
export const postVerifyUserByIfByVerificationId = async (
  req: Request<{ userId: string; verificationId: string }>,
  res: Response,
) => {
  const { userId, verificationId } = req.params

  const expectedVerficaitonId = await getVerificationIdForUser(
    new mongoose.Types.ObjectId(userId),
  )

  if (expectedVerficaitonId === verificationId) {
    const user: IUserDao = await getUserByUserId(
      new mongoose.Types.ObjectId(userId),
    )
    user.userState = UserStateEnumDao.NEVER_LOGGED_IN
    await user.save()
  } else {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `Verification ID ${verificationId} is not valid for user ${userId}.`,
    )
  }

  res.status(204).end()
}

/**
 * Create a new payment intent.
 * @param {Request<any, any, PaymentIntentRequest>} req The incoming request containing the payment method and user data.
 * @param {Response} res The outgoing response.
 */
export const createPaymentIntent = async (
  req: Request<any, any, any>,
  res: Response,
) => {
  const { userId, paymentMethodId } = req.params
  const { payment, savePaymentMethod, rentalID } = req.body
  const { session } = res.locals

  if (userId && paymentMethodId) {
    if (userId !== session.id) {
      throw new ApiError(
        ApiErrorCodes.FORBIDDEN,
        `User ${session.id.toString()} is not allowed to create payment for user ${userId.toString()}.`,
      )
    } else {
      // Create payment if requested
      // eslint-disable-next-line
      if (payment) {
        const response = await createPaymentIntentForUser(
          paymentMethodId,
          userId,
          payment,
          savePaymentMethod,
          rentalID,
        )
        if (response === 'Success') {
          res.status(200).end()
        } else {
          res.status(500).json({
            error: 'Server Error',
          })
        }
      } else {
        // Create payment method if no payment requested
        const response = await createStripePaymentMethodForUser(
          paymentMethodId,
          userId,
        )
        if (response === 'Payment method created') {
          res.status(200).end()
        } else {
          res.status(500).json({
            error: 'Server Error',
          })
        }
      }
    }
  } else {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      'paymentmethod and user need to be defined',
    )
  }
}

/**
 * Change the password of a user
 * @param {Request<{ userId: string }, any, {oldPassword: string, newPassword: string}>} req the incoming request containing the user id and the old and new password
 * @param {Response} res the outgoing response indicating the success of the password change
 */
export const postUserByIdChangePassword = async (
  req: Request<
    { userId: string },
    any,
    { oldPassword: string; newPassword: string }
  >,
  res: Response,
) => {
  const { userId } = req.params
  const { session } = res.locals
  const { oldPassword, newPassword } = req.body

  if (userId !== session.id) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `User ${session.id.toString()} is not allowed to change password for user ${userId.toString()}.`,
    )
  }

  await updateUserPassword(
    new mongoose.Types.ObjectId(userId),
    oldPassword,
    newPassword,
  )

  res.status(204).end()
}
