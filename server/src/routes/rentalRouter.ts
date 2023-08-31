import { Router } from 'express'
import asyncWrapper from 'src/middleware/errorhandler/asyncWrapper'
import checkJwt from '../middleware/authentication/auth-middleware'
import {
  postRentals,
  getRentalById,
  getRentals,
  getRentalIdMessages,
  postRentalIdMessage,
  getRentalByIdPayment,
  getRentalByIdHandover,
  postRentalByIdHandover,
  postRentalByIdAccept,
  postRentalByIdDecline,
  getRentalByIdItem,
  getRentalByIdItemRating,
  postRentalByIdItemRating,
  getRentalByIdUserRenter,
  getRentalByIdUserLender,
  getRentalByIdUserRenterRating,
  postRentalByIdUserRenterRating,
  getRentalByIdUserLenderRating,
  postRentalByIdUserLenderRating,
  postRentalByIdHandoverAccept,
  postRentalByIdHandoverDecline,
  postRentalByIdPayByPaymentId,
} from '../controllers/rentalController'

const rentalRouter = () => {
  const router = Router()

  router.use('/rentals', checkJwt)

  router.get('/rentals', asyncWrapper(getRentals))
  router.post('/rentals', asyncWrapper(postRentals))
  router.get('/rentals/:rentalId', asyncWrapper(getRentalById))
  router.post('/rentals/:rentalId/accept', asyncWrapper(postRentalByIdAccept))
  router.post('/rentals/:rentalId/decline', asyncWrapper(postRentalByIdDecline))
  router.post(
    '/rentals/:rentalId/pay/:paymentId',
    asyncWrapper(postRentalByIdPayByPaymentId),
  )
  router.get('/rentals/:rentalId/message', asyncWrapper(getRentalIdMessages))
  router.post('/rentals/:rentalId/message', asyncWrapper(postRentalIdMessage))
  router.get('/rentals/:rentalId/payment', asyncWrapper(getRentalByIdPayment))
  router.get('/rentals/:rentalId/handover', asyncWrapper(getRentalByIdHandover))
  router.post(
    '/rentals/:rentalId/handover',
    asyncWrapper(postRentalByIdHandover),
  )
  router.post(
    '/rentals/:rentalId/handover/accept',
    asyncWrapper(postRentalByIdHandoverAccept),
  )
  router.post(
    '/rentals/:rentalId/handover/decline',
    asyncWrapper(postRentalByIdHandoverDecline),
  )
  router.get('/rentals/:rentalId/item', asyncWrapper(getRentalByIdItem))
  router.get(
    '/rentals/:rentalId/item/rating',
    asyncWrapper(getRentalByIdItemRating),
  )
  router.post(
    '/rentals/:rentalId/item/rating',
    asyncWrapper(postRentalByIdItemRating),
  )
  router.get(
    '/rentals/:rentalId/user/renter',
    asyncWrapper(getRentalByIdUserRenter),
  )
  router.get(
    '/rentals/:rentalId/user/renter/rating',
    asyncWrapper(getRentalByIdUserRenterRating),
  )
  router.post(
    '/rentals/:rentalId/user/renter/rating',
    asyncWrapper(postRentalByIdUserRenterRating),
  )
  router.get(
    '/rentals/:rentalId/user/lender',
    asyncWrapper(getRentalByIdUserLender),
  )
  router.get(
    '/rentals/:rentalId/user/lender/rating',
    asyncWrapper(getRentalByIdUserLenderRating),
  )
  router.post(
    '/rentals/:rentalId/user/lender/rating',
    asyncWrapper(postRentalByIdUserLenderRating),
  )

  return router
}

export default rentalRouter
