import { NextFunction, Request, Response } from 'express'
import { ApiError, ApiErrorCodes } from './APIError'

/**
 * The string representation of an internal server error.
 */
const INTERNAL_SERVER_ERROR_STR = 'Internal Server Error'

/**
 * Custom Error handler middleware for Express.
 * @param error - The error object to handle.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 */
const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  let status: number
  if (error && !(error instanceof ApiError)) {
    switch (error.name) {
      case 'CastError':
      case 'ValidationError': {
        // Set the status code to 400 for CastError and ValidationError
        status = ApiErrorCodes.BAD_REQUEST
        break
      }
      case 'BSONError': {
        // Set the status code to 400 for BSONError, which is most likely a malformed type/json in the request
        status = ApiErrorCodes.BAD_REQUEST
        break
      }
      default: {
        // Set the status code to 500 for other errors
        status = ApiErrorCodes.INTERNAL_SERVER_ERROR
      }
    }
  } else {
    status = error?.status || ApiErrorCodes.INTERNAL_SERVER_ERROR
  }
  const message = error?.message || INTERNAL_SERVER_ERROR_STR

  res.status(status).send({
    message,
  })
}
export default errorHandler
