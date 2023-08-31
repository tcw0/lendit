import { encode, decode, TAlgorithm } from 'jwt-simple'

export interface User {
  id: number
  dateCreated: number
  username: string
  password: string
}

export interface Session {
  id: number
  dateCreated: number
  username: string
  /**
   * Timestamp indicating when the session was created, in Unix milliseconds.
   */
  issued: number
  /**
   * Timestamp indicating when the session should expire, in Unix milliseconds.
   */
  expires: number
}

/**
 * Identical to the Session type, but without the `issued` and `expires` properties.
 */
export type PartialSession = Omit<Session, 'issued' | 'expires'>

export interface EncodeResult {
  token: string
  expires: number
  issued: number
}

export type DecodeResult =
  | {
      type: 'valid'
      session: Session
    }
  | {
      type: 'integrity-error'
    }
  | {
      type: 'invalid-token'
    }

export type ExpirationStatus = 'expired' | 'active' | 'grace'

export function encodeSession(
  secretKey: string,
  partialSession: PartialSession,
): EncodeResult {
  // Always use HS512 to sign the token
  const algorithm: TAlgorithm = 'HS512'
  // Determine when the token should expire
  const issued = Date.now()
  const twoHoursInMs = 2 * 60 * 60 * 1000
  const expires = issued + twoHoursInMs
  const session: Session = {
    ...partialSession,
    issued,
    expires,
  }

  return {
    token: encode(session, secretKey, algorithm),
    issued,
    expires,
  }
}

export function decodeSession(
  secretKey: string,
  tokenString: string,
): DecodeResult {
  // Always use HS512 to decode the token
  const algorithm: TAlgorithm = 'HS512'

  let result: Session

  try {
    result = decode(tokenString, secretKey, false, algorithm)
  } catch (_e) {
    const e: Error = _e as Error

    // These error strings can be found here:
    // https://github.com/hokaccha/node-jwt-simple/blob/c58bfe5e5bb049015fcd55be5fc1b2d5c652dbcd/lib/jwt.js
    if (
      e.message === 'No token supplied' ||
      e.message === 'Not enough or too many segments'
    ) {
      return {
        type: 'invalid-token',
      }
    }

    if (
      e.message === 'Signature verification failed' ||
      e.message === 'Algorithm not supported'
    ) {
      return {
        type: 'integrity-error',
      }
    }

    // Handle json parse errors, thrown when the payload is nonsense
    if (e.message.indexOf('Unexpected token') === 0) {
      return {
        type: 'invalid-token',
      }
    }

    throw e
  }

  return {
    type: 'valid',
    session: result,
  }
}

export function checkExpirationStatus(token: Session): ExpirationStatus {
  const now = Date.now()

  if (token.expires > now) return 'active'

  // Find the timestamp for the end of the token's grace period
  const threeHoursInMs = 3 * 60 * 60 * 1000
  const threeHoursAfterExpiration = token.expires + threeHoursInMs

  if (threeHoursAfterExpiration > now) return 'grace'

  return 'expired'
}
