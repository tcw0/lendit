import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
} from 'sib-api-v3-typescript'
import logger from 'src/middleware/logger/logger'
import env from './env'

/**
 * Create a new instance of the TransactionalEmailsApi with the API key from .env
 */
export const transactionAPI = new TransactionalEmailsApi()
transactionAPI.setApiKey(
  TransactionalEmailsApiApiKeys.apiKey,
  env.MAIL_API_KEY as string,
)

transactionAPI
  .getSmtpReport(1)
  .then(() => {
    logger.info('Connected to SIB mail API.')
  })
  .catch(err => {
    logger.error('Failed to connect to SIB mail API:', err)
  })

export default transactionAPI
