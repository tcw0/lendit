import { Request, Response, NextFunction } from 'express'
import {
  ExpirationStatus,
  DecodeResult,
  decodeSession,
  checkExpirationStatus,
  encodeSession,
  Session,
} from './jwt'
import env from '../../config/env'

// Check JWT
export default function checkJwt(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const unauthorized = (message: string) =>
    response.status(401).json({
      ok: false,
      status: 401,
      message,
    })

  const requestHeader = 'X-JWT-Token'
  const responseHeader = 'X-Renewed-JWT-Token'
  const header = request.header(requestHeader)

  if (!header) {
    unauthorized(`Required ${requestHeader} header not found.`)
    return
  }

  const decodedSession: DecodeResult = decodeSession(
    env.SECRET_KEY ?? '',
    header,
  )

  if (
    decodedSession.type === 'integrity-error' ||
    decodedSession.type === 'invalid-token'
  ) {
    unauthorized(
      `Failed to decode or validate authorization token. Reason: ${decodedSession.type}.`,
    )
    return
  }

  const expiration: ExpirationStatus = checkExpirationStatus(
    decodedSession.session,
  )

  if (expiration === 'expired') {
    unauthorized(
      `Authorization token has expired. Please create a new authorization token.`,
    )
    return
  }

  let session: Session

  if (expiration === 'grace') {
    // Automatically renew the session and send it back with the response
    const { token, expires, issued } = encodeSession(
      env.SECRET_KEY ?? '',
      decodedSession.session,
    )
    session = {
      ...decodedSession.session,
      expires,
      issued,
    }

    response.setHeader(responseHeader, token)
    response.setHeader('Access-Control-Expose-Headers', responseHeader)
  } else {
    session = decodedSession.session
  }

  // Set the session on response.locals object for routes to access
  response.locals = {
    ...response.locals,
    session,
  }

  // Request has a valid or renewed session. Call next to continue to the authenticated route handler
  next()
}
