/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChatMessageDto,
  HandoverDto,
  HandoverTypeEnum,
  ItemMetaDataDto,
  ItemRatingDto,
  NewChatMessageDto,
  NewHandoverDto,
  NewRatingDto,
  NewRentalDto,
  PaymentDto,
  RentalDto,
  RentalMetadataDto,
  UserMetaDataDto,
  UserRatingDto,
} from '@api/generated'
import { Request, Response } from 'express'
import { convertRentalDaoToDto } from 'src/services/converters/rentalConverterService'
import {
  createNewRental,
  getAllRentalsMetadata,
  getRentalWithAccessCheckAndRole,
  markChatsAsRead,
  updateRentalStateAfterAction,
} from 'src/services/rentalService'
import mongoose from 'mongoose'
import {
  createNewChatMessage,
  createNewSystemMessageForRental,
} from 'src/services/chatMessageService'
import { convertChatMessageDaoToDto } from 'src/services/converters/messageConverterService'
import { convertPaymentDaoToDto } from 'src/services/converters/paymentConverterService'
import { convertHandoverDaoToDto } from 'src/services/converters/handoverConverterService'
import {
  acceptHandover,
  createNewHandover,
  ensureHandoverOnCreationValidity,
  ensureHandoverOnModificationValidity,
} from 'src/services/handoverService'
import { RentalRole, RentalStateEnumDao } from 'src/models/RentalDao'
import { getItemById } from 'src/services/itemService'
import { convertItemDaoToItemMetaDataDto } from 'src/services/converters/itemConverterService'
import {
  createItemRatingForItem,
  createUserRatingForUser,
  getItemRatingById,
  getUserRatingById,
  updateAggregatedItemRatingByItemId,
  updateAggregatedUserRatingByUserId,
} from 'src/services/ratingService'
import {
  convertItemRatingDaoToDto,
  convertUserRatingDaoToDto,
} from 'src/services/converters/ratingConverterService'
import { getUserByUserId } from 'src/services/userService'
import { convertUserDaoToUserMetaDataDto } from 'src/services/converters/userDtoConverter'
import { IHandoverDao } from 'src/models/HandoverDao'
import { IChatMessageDao } from 'src/models/ChatMessageDao'
import { addAvailabilityToBlacklistForRental } from 'src/services/availabilityService'
import { ApiError, ApiErrorCodes } from 'src/middleware/errorhandler/APIError'
import { payWithPaymentByIdAndUserIdAndAmount } from 'src/services/paymentService'
import { prepareAndSendInsuranceMail } from 'src/services/mailService'

/**
 * Create a new rental.
 * @param { Request<any, any, NewRentalDto> } req the incomming request including the new rental.
 * @param { Response<RentalDto> } res the outgoing response including the new rental with an ID.
 * @returns { Response } the response with the new rental with an ID.
 */
export const postRentals = async (
  req: Request<any, any, NewRentalDto>,
  res: Response<RentalDto>,
) => {
  const { session } = res.locals

  const newRental = await createNewRental(req.body, session.id)
  const toReturnRentalDto: RentalDto = await convertRentalDaoToDto(newRental)

  res.status(201).json(toReturnRentalDto)
}

/**
 * Get all rental metadata of the current user.
 * @param {Request} req the incoming request.
 * @param {Response<RentalMetadataDto[]>} res the outgoing response including all rental metadata of the current user.
 */
export const getRentals = async (
  req: Request,
  res: Response<RentalMetadataDto[]>,
) => {
  const { session } = res.locals

  const rentalMetadataDtos: RentalMetadataDto[] = await getAllRentalsMetadata(
    session.id,
  )

  res.status(200).json(rentalMetadataDtos)
}

/**
 * Get a rental by its ID.
 * @param {Request<{ rentalId: ObjectId }>} req the incoming request including the rental ID.
 * @param {Response<RentalDto>} res the outgoing response including the rental.
 */
export const getRentalById = async (
  req: Request<{ rentalId: mongoose.Types.ObjectId }>,
  res: Response<RentalDto>,
) => {
  const { session } = res.locals
  const { rentalId } = req.params

  const { rentalDao } = await getRentalWithAccessCheckAndRole(
    rentalId,
    session.id,
  )
  await markChatsAsRead(rentalId, session.id)
  const rentalDto = await convertRentalDaoToDto(rentalDao)

  res.status(200).json(rentalDto)
}

/**
 * Get all messages of a rental by rental id.
 * @param {Request<{ rentalId: ObjectId }>} req the incoming request including the rental ID.
 * @param {Response<ChatMessageDto[]>} res the outgoing response including all messages of the rental.
 */
export const getRentalIdMessages = async (
  req: Request<{ rentalId: mongoose.Types.ObjectId }>,
  res: Response<ChatMessageDto[]>,
) => {
  const { session } = res.locals
  const { rentalId } = req.params

  const { rentalDao } = await getRentalWithAccessCheckAndRole(
    rentalId,
    session.id,
  )
  const messageDtos = rentalDao.messages
    .map(messageDao => messageDao && convertChatMessageDaoToDto(messageDao))
    .filter(message => message !== null) as ChatMessageDto[]

  res.status(200).json(messageDtos)
}

/**
 * Post a new message to a rental by rental id.
 * @param {Request<{ rentalId: ObjectId }, any, NewChatMessageDto>} req the incoming request including the rental ID.
 * @param {Response<ChatMessageDto>} res the outgoing response including the new message.
 */
export const postRentalIdMessage = async (
  req: Request<{ rentalId: mongoose.Types.ObjectId }, any, NewChatMessageDto>,
  res: Response<ChatMessageDto>,
) => {
  const { session } = res.locals
  const { rentalId } = req.params

  const { rentalDao } = await getRentalWithAccessCheckAndRole(
    rentalId,
    session.id,
  )
  const newMessage: IChatMessageDao = await createNewChatMessage(
    req.body,
    false,
    session.id,
    rentalDao,
  )
  const messageDto = convertChatMessageDaoToDto(newMessage)

  res.status(201).json(messageDto)
}

/**
 * Get a payment by rental id.
 * @param {Request<{ rentalId: ObjectId }>} req the incoming request including the rental ID.
 * @param {Response<PaymentDto>} res the outgoing response including the payment.
 */
export const getRentalByIdPayment = async (
  req: Request<{ rentalId: mongoose.Types.ObjectId }>,
  res: Response<PaymentDto>,
) => {
  const { session } = res.locals
  const { rentalId } = req.params

  const { rentalDao } = await getRentalWithAccessCheckAndRole(
    rentalId,
    session.id,
  )
  const paymentDto = convertPaymentDaoToDto(rentalDao.payment)

  res.status(200).json(paymentDto)
}

/**
 * Get a handover by rental id and handover type.
 * @param {Request<{ rentalId: ObjectId, handoverType: HandoverTypeEnum}>} req the incoming request including the rental ID and the handover type.
 * @param {Response<HandoverDto>} res the outgoing response including the handover.
 */
export const getRentalByIdHandover = async (
  req: Request<
    {
      rentalId: mongoose.Types.ObjectId
    },
    any,
    any,
    { handoverType: HandoverTypeEnum }
  >,
  res: Response<HandoverDto>,
) => {
  const { session } = res.locals
  const { rentalId } = req.params
  const { handoverType } = req.query

  const { rentalDao } = await getRentalWithAccessCheckAndRole(
    rentalId,
    session.id,
  )
  if (handoverType === HandoverTypeEnum.PICKUP && rentalDao.pickUpHandover) {
    const handoverDto = convertHandoverDaoToDto(rentalDao.pickUpHandover)
    res.status(200).json(handoverDto)
  } else if (
    handoverType === HandoverTypeEnum.RETURN &&
    rentalDao.returnHandover
  ) {
    const handoverDto = convertHandoverDaoToDto(rentalDao.returnHandover)
    res.status(200).json(handoverDto)
  } else {
    res.status(204).send()
  }
}

/**
 * Create a new handover by rental id and handover type.
 * @param {Request<{ rentalId: mongoose.Types.ObjectId }, any, NewHandoverDto>} req the incoming request including the rental ID and the handover type.
 * @param {Response<HandoverDto>} res the outgoing response with the new handover.
 */
export const postRentalByIdHandover = async (
  req: Request<{ rentalId: mongoose.Types.ObjectId }, any, NewHandoverDto>,
  res: Response<HandoverDto>,
) => {
  const { session } = res.locals
  const { rentalId } = req.params

  const { role, rentalDao } = await getRentalWithAccessCheckAndRole(
    rentalId,
    session.id,
  )
  ensureHandoverOnCreationValidity(req.body, role, rentalDao)
  const newHandover = await createNewHandover(req.body, role)
  if (req.body.handoverType === HandoverTypeEnum.PICKUP) {
    rentalDao.pickUpHandover = newHandover
    rentalDao.rentalState = RentalStateEnumDao.PICKED_UP
  } else if (req.body.handoverType === HandoverTypeEnum.RETURN) {
    rentalDao.returnHandover = newHandover
    rentalDao.rentalState = RentalStateEnumDao.RETURNED
  }
  await rentalDao.save()
  await createNewSystemMessageForRental(
    `A new ${
      req.body.handoverType === HandoverTypeEnum.PICKUP ? 'pickup' : 'return'
    } handover was created.`,
    session.id,
    rentalDao,
  )
  const handoverDto = convertHandoverDaoToDto(newHandover)

  res.status(201).json(handoverDto)
}

/**
 * Accept a handover by rental id and handover type.
 * @param {Request<{ rentalId: mongoose.Types.ObjectId }, any, any, { handoverType: HandoverTypeEnum }>} req the incoming request including the rental ID and the handover type.
 * @param {Response<HandoverDto>} res the outgoing response with the accepted handover.
 */
export const postRentalByIdHandoverAccept = async (
  req: Request<
    { rentalId: mongoose.Types.ObjectId },
    any,
    any,
    { handoverType: HandoverTypeEnum }
  >,
  res: Response<HandoverDto>,
) => {
  const { session } = res.locals
  const { rentalId } = req.params
  const { handoverType } = req.query

  const { role, rentalDao } = await getRentalWithAccessCheckAndRole(
    rentalId,
    session.id,
  )
  await ensureHandoverOnModificationValidity(handoverType, rentalDao)
  let acceptedHandover: IHandoverDao | null = null
  if (handoverType === HandoverTypeEnum.PICKUP && rentalDao.pickUpHandover) {
    acceptedHandover = await acceptHandover(rentalDao.pickUpHandover, role)
  } else if (
    handoverType === HandoverTypeEnum.RETURN &&
    rentalDao.returnHandover
  ) {
    acceptedHandover = await acceptHandover(rentalDao.returnHandover, role)
  }
  if (!acceptedHandover) {
    throw new ApiError(
      ApiErrorCodes.INTERNAL_SERVER_ERROR,
      `Handover for rental ${rentalId.toString()} could not be accepted.`,
    )
  }
  await rentalDao.save()
  await createNewSystemMessageForRental(
    'The handover was accepted.',
    session.id,
    rentalDao,
  )
  await updateRentalStateAfterAction(rentalId)
  const handoverDto = convertHandoverDaoToDto(acceptedHandover)
  res.status(200).json(handoverDto)
}

/**
 * Decline a handover by rental id and handover type.
 * @param {Request<{ rentalId: mongoose.Types.ObjectId }, any, any, { handoverType: HandoverTypeEnum }>} req the incoming request including the rental ID and the handover type.
 * @param {Response} res the outgoing response.
 */
export const postRentalByIdHandoverDecline = async (
  req: Request<
    { rentalId: mongoose.Types.ObjectId },
    any,
    any,
    { handoverType: HandoverTypeEnum }
  >,
  res: Response,
) => {
  const { session } = res.locals
  const { rentalId } = req.params
  const { handoverType } = req.query

  const { rentalDao } = await getRentalWithAccessCheckAndRole(
    rentalId,
    session.id,
  )
  await ensureHandoverOnModificationValidity(handoverType, rentalDao)
  if (handoverType === HandoverTypeEnum.PICKUP) {
    rentalDao.pickUpHandover = undefined
  } else if (handoverType === HandoverTypeEnum.RETURN) {
    rentalDao.returnHandover = undefined
  }
  await createNewSystemMessageForRental(
    'The handover was declined.',
    session.id,
    rentalDao,
  )
  await updateRentalStateAfterAction(rentalId)
  await rentalDao.save()

  res.status(204).send()
}

/**
 * Accepts a rental by rental id.
 * @param {Request<{ rentalId: mongoose.Types.ObjectId }>} req the incoming request including the rental ID.
 * @param {Response<RentalDto>} res the outgoing response including the accepted rental.
 */
export const postRentalByIdAccept = async (
  req: Request<{ rentalId: mongoose.Types.ObjectId }>,
  res: Response<RentalDto>,
) => {
  const { rentalId } = req.params
  const { session } = res.locals

  const { role, rentalDao } = await getRentalWithAccessCheckAndRole(
    rentalId,
    session.id,
  )
  if (role !== RentalRole.LENDER) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `Only the lender can accept the rental ${rentalId.toString()}.`,
    )
  }
  await addAvailabilityToBlacklistForRental(rentalDao)
  await createNewSystemMessageForRental(
    'Rental was accepted.',
    session.id,
    rentalDao,
  )
  rentalDao.rentalState = RentalStateEnumDao.ACCEPTED
  await rentalDao.save()
  const rentalDto = await convertRentalDaoToDto(rentalDao)

  res.status(200).json(rentalDto)
}

/**
 * Declines a rental by rental id.
 * @param {Request<{ rentalId: mongoose.Types.ObjectId }>} req the incoming request including the rental ID.
 * @param {Response<RentalDto>} res the outgoing response including the declined rental.
 */
export const postRentalByIdDecline = async (
  req: Request<{ rentalId: mongoose.Types.ObjectId }>,
  res: Response<RentalDto>,
) => {
  const { rentalId } = req.params
  const { session } = res.locals

  const { role, rentalDao } = await getRentalWithAccessCheckAndRole(
    rentalId,
    session.id,
  )
  if (role !== RentalRole.LENDER) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `Only the lender can decline the rental ${rentalId.toString()}.`,
    )
  }
  await createNewSystemMessageForRental(
    'Rental was declined.',
    session.id,
    rentalDao,
  )
  rentalDao.rentalState = RentalStateEnumDao.DECLINED
  await rentalDao.save()
  const rentalDto = await convertRentalDaoToDto(rentalDao)

  res.status(200).json(rentalDto)
}

/**
 * Pays a rental by rental id as renter.
 * @param {Request<{ rentalId: mongoose.Types.ObjectId, paymentId: mongoose.Types.ObjectId }>} req the incoming request including the rental ID.
 * @param {Response<RentalDto>} res the outgoing response including the paid rental.
 */
export const postRentalByIdPayByPaymentId = async (
  req: Request<{
    rentalId: mongoose.Types.ObjectId
    paymentId: mongoose.Types.ObjectId
  }>,
  res: Response<RentalDto>,
) => {
  const { rentalId, paymentId } = req.params
  const { session } = res.locals

  const { role, rentalDao } = await getRentalWithAccessCheckAndRole(
    rentalId,
    session.id,
  )
  if (role !== RentalRole.RENTER) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `Only the renter can pay the rental ${rentalId.toString()}.`,
    )
  }
  if (rentalDao.payment.paymentFromRenter) {
    throw new ApiError(
      ApiErrorCodes.CONFLICT,
      `The rental ${rentalId.toString()} was already paid.`,
    )
  }
  await payWithPaymentByIdAndUserIdAndAmount(
    paymentId,
    session.id,
    rentalDao.payment.rentalAmount + rentalDao.payment.insuranceAmount,
  )
  rentalDao.payment.paymentFromRenter = new Date()
  await rentalDao.save()
  await prepareAndSendInsuranceMail(rentalDao)
  await createNewSystemMessageForRental(
    'Rental was paid.',
    session.id,
    rentalDao,
  )
  const rentalDaoUpdated = await updateRentalStateAfterAction(rentalId)
  const rentalDto = await convertRentalDaoToDto(rentalDaoUpdated)

  res.status(200).json(rentalDto)
}

/**
 * Gets the item that is part of a rental by rental id.
 * @param {Request<{ rentalId: mongoose.Types.ObjectId }>} req the incoming request including the rental ID.
 * @param {Response<ItemMetaDataDto>} res the outgoing response including the item.
 */
export const getRentalByIdItem = async (
  req: Request<{ rentalId: mongoose.Types.ObjectId }>,
  res: Response<ItemMetaDataDto>,
) => {
  const { rentalId } = req.params
  const { session } = res.locals

  const { rentalDao } = await getRentalWithAccessCheckAndRole(
    rentalId,
    session.id,
  )
  const itemDao = await getItemById(
    new mongoose.Types.ObjectId(rentalDao.itemId.toString()),
    true,
  )
  const itemMetadataDto = await convertItemDaoToItemMetaDataDto(itemDao)

  res.status(200).json(itemMetadataDto)
}

/**
 * Gets the item rating for the item that is part of a rental by rental id.
 * @param {Request<{ rentalId: mongoose.Types.ObjectId }>} req the incoming request including the rental ID.
 * @param {Response<ItemRatingDto>} res the outgoing response including the item rating.
 */
export const getRentalByIdItemRating = async (
  req: Request<{ rentalId: mongoose.Types.ObjectId }>,
  res: Response<ItemRatingDto>,
) => {
  const { rentalId } = req.params
  const { session } = res.locals

  const { rentalDao } = await getRentalWithAccessCheckAndRole(
    rentalId,
    session.id,
  )
  if (!rentalDao.itemRatingId) {
    res.status(204).send()
  } else {
    const itemRatingDao = await getItemRatingById(
      new mongoose.Types.ObjectId(rentalDao.itemRatingId.toString()),
    )
    const itemRatingDto = await convertItemRatingDaoToDto(itemRatingDao)
    res.status(200).json(itemRatingDto)
  }
}

/**
 * Creates an item rating for the item that is part of a rental by rental id.
 * @param {Request<{ rentalId: mongoose.Types.ObjectId }, any, NewRatingDto>} req the incoming request including the rental ID and the item rating to create.
 * @param {Response<ItemRatingDto>} res the outgoing response including the item rating.
 */
export const postRentalByIdItemRating = async (
  req: Request<{ rentalId: mongoose.Types.ObjectId }, any, NewRatingDto>,
  res: Response<ItemRatingDto>,
) => {
  const { rentalId } = req.params
  const { session } = res.locals

  const { role, rentalDao } = await getRentalWithAccessCheckAndRole(
    rentalId,
    session.id,
  )
  if (rentalDao.itemRatingId) {
    throw new ApiError(
      ApiErrorCodes.CONFLICT,
      `Rental ${rentalId.toString()} already has an item rating.`,
    )
  }
  if (role === RentalRole.LENDER) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `User ${session.id.toString()} (lender) is not allowed to rate the item of rental ${rentalId.toString()}.`,
    )
  }
  const itemRatingDao = await createItemRatingForItem(
    req.body,
    new mongoose.Types.ObjectId(rentalDao.itemId.toString()),
    session.id,
  )
  rentalDao.itemRatingId = itemRatingDao._id
  await rentalDao.save()
  await updateRentalStateAfterAction(rentalId)
  await updateAggregatedItemRatingByItemId(
    new mongoose.Types.ObjectId(rentalDao.itemId.toString()),
  )
  const itemRatingDto = await convertItemRatingDaoToDto(itemRatingDao)

  res.status(200).json(itemRatingDto)
}

/**
 * Gets the renter of a rental.
 * @param {Request<{ rentalId: mongoose.Types.ObjectId }>} req the incoming request including the rental ID.
 * @param {Response<UserMetaDataDto>} res the outgoing response including the renter.
 */
export const getRentalByIdUserRenter = async (
  req: Request<{ rentalId: mongoose.Types.ObjectId }>,
  res: Response<UserMetaDataDto>,
) => {
  const { rentalId } = req.params
  const { session } = res.locals

  const { rentalDao } = await getRentalWithAccessCheckAndRole(
    rentalId,
    session.id,
  )
  const userDao = await getUserByUserId(
    new mongoose.Types.ObjectId(rentalDao.renterId.toString()),
    true,
  )
  const userMetaDataDto = convertUserDaoToUserMetaDataDto(userDao)

  res.status(200).json(userMetaDataDto)
}

/**
 * Gets the renter rating of a rental.
 * @param {Request<{ rentalId: mongoose.Types.ObjectId }>} req the incoming request including the rental ID.
 * @param {Response<UserRatingDto>} res the outgoing response including the renter rating.
 */
export const getRentalByIdUserRenterRating = async (
  req: Request<{ rentalId: mongoose.Types.ObjectId }>,
  res: Response<UserRatingDto>,
) => {
  const { rentalId } = req.params
  const { session } = res.locals

  const { rentalDao } = await getRentalWithAccessCheckAndRole(
    rentalId,
    session.id,
  )
  if (!rentalDao.renterRatingId) {
    res.status(204).send()
  } else {
    const userRatingDao = await getUserRatingById(
      new mongoose.Types.ObjectId(rentalDao.renterRatingId.toString()),
    )
    const userRatingDto = await convertUserRatingDaoToDto(userRatingDao)
    res.status(200).json(userRatingDto)
  }
}

/**
 * Creates a renter rating for the renter of a rental.
 * @param {Request<{ rentalId: mongoose.Types.ObjectId }, any, NewRatingDto>} req the incoming request including the rental ID and the renter rating to create.
 * @param {Response<UserRatingDto>} res the outgoing response including the renter rating.
 */
export const postRentalByIdUserRenterRating = async (
  req: Request<{ rentalId: mongoose.Types.ObjectId }, any, NewRatingDto>,
  res: Response<UserRatingDto>,
) => {
  const { rentalId } = req.params
  const { session } = res.locals

  const { role, rentalDao } = await getRentalWithAccessCheckAndRole(
    rentalId,
    session.id,
  )
  if (rentalDao.renterRatingId) {
    throw new ApiError(
      ApiErrorCodes.CONFLICT,
      `Rental ${rentalId.toString()} already has a renter rating.`,
    )
  }
  if (role === RentalRole.RENTER) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `User ${session.id.toString()} (renter) is not allowed to rate the renter of rental ${rentalId.toString()}.`,
    )
  }
  const userRatingDao = await createUserRatingForUser(
    req.body,
    new mongoose.Types.ObjectId(rentalDao.renterId.toString()),
    session.id,
  )
  rentalDao.renterRatingId = userRatingDao._id
  await rentalDao.save()
  await updateRentalStateAfterAction(rentalId)
  await updateAggregatedUserRatingByUserId(
    new mongoose.Types.ObjectId(rentalDao.renterId.toString()),
  )
  const userRatingDto = await convertUserRatingDaoToDto(userRatingDao)

  res.status(200).json(userRatingDto)
}

/**
 * get the lender of a rental.
 * @param {Request<{ rentalId: mongoose.Types.ObjectId }>} req the incoming request including the rental ID.
 * @param {Response<UserMetaDataDto>} res the outgoing response including the lender.
 */
export const getRentalByIdUserLender = async (
  req: Request<{ rentalId: mongoose.Types.ObjectId }>,
  res: Response<UserMetaDataDto>,
) => {
  const { rentalId } = req.params
  const { session } = res.locals

  const { rentalDao } = await getRentalWithAccessCheckAndRole(
    rentalId,
    session.id,
  )
  const userDao = await getUserByUserId(
    new mongoose.Types.ObjectId(rentalDao.lenderId.toString()),
    true,
  )
  const userMetaDataDto = convertUserDaoToUserMetaDataDto(userDao)

  res.status(200).json(userMetaDataDto)
}

/**
 * Gets the lender rating of a rental.
 * @param {Request<{ rentalId: mongoose.Types.ObjectId }>} req the incoming request including the rental ID.
 * @param {Response<UserRatingDto>} res the outgoing response including the lender rating.
 */
export const getRentalByIdUserLenderRating = async (
  req: Request<{ rentalId: mongoose.Types.ObjectId }>,
  res: Response<UserRatingDto>,
) => {
  const { rentalId } = req.params
  const { session } = res.locals

  const { rentalDao } = await getRentalWithAccessCheckAndRole(
    rentalId,
    session.id,
  )
  if (!rentalDao.lenderRatingId) {
    res.status(204).send()
  } else {
    const userRatingDao = await getUserRatingById(
      new mongoose.Types.ObjectId(rentalDao.lenderRatingId.toString()),
    )
    const userRatingDto = await convertUserRatingDaoToDto(userRatingDao)
    res.status(200).json(userRatingDto)
  }
}

/**
 * Creates a lender rating for the lender of a rental.
 * @param {Request<{ rentalId: mongoose.Types.ObjectId }, any, NewRatingDto>} req the incoming request including the rental ID and the renter rating to create.
 * @param {Response<UserRatingDto>} res the outgoing response including the lender rating.
 */
export const postRentalByIdUserLenderRating = async (
  req: Request<{ rentalId: mongoose.Types.ObjectId }, any, NewRatingDto>,
  res: Response<UserRatingDto>,
) => {
  const { rentalId } = req.params
  const { session } = res.locals

  const { role, rentalDao } = await getRentalWithAccessCheckAndRole(
    rentalId,
    session.id,
  )
  if (rentalDao.lenderRatingId) {
    throw new ApiError(
      ApiErrorCodes.CONFLICT,
      `Rental ${rentalId.toString()} already has a lender rating.`,
    )
  }
  if (role === RentalRole.LENDER) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      `User ${session.id.toString()} (lender) is not allowed to rate the lender of rental ${rentalId.toString()}.`,
    )
  }
  const userRatingDao = await createUserRatingForUser(
    req.body,
    new mongoose.Types.ObjectId(rentalDao.lenderId.toString()),
    session.id,
  )
  rentalDao.lenderRatingId = userRatingDao._id
  await rentalDao.save()
  await updateRentalStateAfterAction(rentalId)
  await updateAggregatedUserRatingByUserId(
    new mongoose.Types.ObjectId(rentalDao.lenderId.toString()),
  )
  const userRatingDto = await convertUserRatingDaoToDto(userRatingDao)

  res.status(200).json(userRatingDto)
}
