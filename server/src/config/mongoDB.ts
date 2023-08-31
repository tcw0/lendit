import { connect } from 'mongoose'
import logger from 'src/middleware/logger/logger'
import env from './env'

const connectDB = async (): Promise<void> => {
  if (env.MONGODB_MODE === 'LOCAL') {
    await connect(env.MONGODB_URLLOCAL as string).then(() => {
      logger.info('Connected to MongoDB local database.')
    })
  } else if (env.MONGODB_MODE === 'REMOTE') {
    await connect(env.MONGODB_URLREMOTE as string).then(() => {
      logger.info('Connected to MongoDB remote database.')
    })
  }
}

export default connectDB
