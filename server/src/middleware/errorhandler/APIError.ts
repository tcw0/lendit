/**
 * API error codes as specified in RFC 2616.
 */
export enum ApiErrorCodes {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  I_AM_A_TEAPOT = 418,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * An API error that can be handled by the custom error handler.
 */
export class ApiError extends Error {
  status: ApiErrorCodes

  message: string

  constructor(status: ApiErrorCodes, message: string) {
    super()
    this.status = status
    this.message = message
  }
}
