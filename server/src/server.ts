import * as http from 'http'
import connectDB from './config/mongoDB'
import app from './app'
import env from './config/env'
import { logger } from './middleware/logger/logger'

connectDB()
const server = http.createServer(app)
server.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}.`)
})
