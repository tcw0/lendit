import { Router } from 'express'
import asyncWrapper from 'src/middleware/errorhandler/asyncWrapper'
import {
  postItem,
  deleteItem,
  getItemRentals,
  putItemById,
  searchItem,
  getById,
  featuredItems,
  getAllItemRatings,
  getItemsByItemIdAvailability,
  getItemsByItemIdUserLender,
  postItemsByItemIdAvailability,
  postItemByIdFeatured,
  getItemsByIdMetadata,
} from '../controllers/itemController'
import checkJwt from '../middleware/authentication/auth-middleware'

const itemRouter = () => {
  const router = Router()

  router.put('/items/*', checkJwt)
  router.post('/items', checkJwt)
  router.delete('/items/*', checkJwt)

  router.post('/items', asyncWrapper(postItem))
  router.get('/items/featured', asyncWrapper(featuredItems))
  router.get('/items/search', asyncWrapper(searchItem))
  router.get('/items/:itemId', asyncWrapper(getById))
  router.get('/items/:itemId/metadata', asyncWrapper(getItemsByIdMetadata))
  router.put('/items/:itemId', asyncWrapper(putItemById))
  router.delete('/items/:itemId', asyncWrapper(deleteItem))

  router.use('/items/:itemId/availability', checkJwt)
  router.get(
    '/items/:itemId/availability',
    asyncWrapper(getItemsByItemIdAvailability),
  )
  router.post(
    '/items/:itemId/availability',
    asyncWrapper(postItemsByItemIdAvailability),
  )

  router.use('/items/:itemId/featured', checkJwt)
  router.post('/items/:itemId/featured', asyncWrapper(postItemByIdFeatured))

  router.get(
    '/items/:itemId/user/lender',
    asyncWrapper(getItemsByItemIdUserLender),
  )

  router.use('/items/:itemId/ratings', checkJwt)
  router.use('/items/:itemId/rentals', checkJwt)
  router.get('/items/:itemId/ratings', asyncWrapper(getAllItemRatings))
  router.get('/items/:itemId/rentals', asyncWrapper(getItemRentals))

  return router
}

export default itemRouter
