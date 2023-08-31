import { Router } from 'express'
import asyncWrapper from 'src/middleware/errorhandler/asyncWrapper'
import checkJwt from '../middleware/authentication/auth-middleware'
import {
  postUser,
  getUserById,
  putUserById,
  deleteUserById,
  getUserByIdItems,
  postUserLogin,
  getUserByIdRatings,
  getUserByIdAddress,
  postUserByIdAddress,
  deleteUserByIdAddressById,
  putUserByIdAddressById,
  postUploadPicture,
  getUserByIdPayment,
  postUserByIdPayment,
  deleteUserByIdPaymentById,
  putUserByIdPaymentById,
  postVerifyUserByIfByVerificationId,
  createPaymentIntent,
  postUserByIdChangePassword,
} from '../controllers/userController'

const userRouter = () => {
  const router = Router()

  router.post('/users/register', asyncWrapper(postUser))
  router.post('/users/login', asyncWrapper(postUserLogin))
  router.post(
    '/users/:userId/verify/:verificationId',
    asyncWrapper(postVerifyUserByIfByVerificationId),
  )

  router.use('/users/pictureUpload', checkJwt)
  router.post('/users/pictureUpload', asyncWrapper(postUploadPicture))

  router.use('/users/:userId', checkJwt)

  router.post(
    '/users/:userId/create-payment-intent/:paymentMethodId',
    asyncWrapper(createPaymentIntent),
  )
  router.post(
    '/users/:userId/changepassword',
    asyncWrapper(postUserByIdChangePassword),
  )

  router.get('/users/:userId', asyncWrapper(getUserById))
  router.put('/users/:userId', asyncWrapper(putUserById))
  router.delete('/users/:userId', asyncWrapper(deleteUserById))
  router.get('/users/:userId/address', asyncWrapper(getUserByIdAddress))
  router.post('/users/:userId/address', asyncWrapper(postUserByIdAddress))
  router.delete(
    '/users/:userId/address/:addressId',
    asyncWrapper(deleteUserByIdAddressById),
  )
  router.put(
    '/users/:userId/address/:addressId',
    asyncWrapper(putUserByIdAddressById),
  )
  router.get('/users/:userId/items', asyncWrapper(getUserByIdItems))
  router.get('/users/:userId/ratings', asyncWrapper(getUserByIdRatings))
  router.get('/users/:userId/payment', asyncWrapper(getUserByIdPayment))
  router.post('/users/:userId/payment', asyncWrapper(postUserByIdPayment))
  router.put(
    '/users/:userId/payment/:paymentMethodId',
    asyncWrapper(putUserByIdPaymentById),
  )
  router.delete(
    '/users/:userId/payment/:paymentMethodId',
    asyncWrapper(deleteUserByIdPaymentById),
  )

  return router
}

export default userRouter
