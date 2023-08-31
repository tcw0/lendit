import express, { Request, Response } from 'express'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import cors from 'cors'
import fileUpload from 'express-fileupload'
import checkJwt from './middleware/authentication/auth-middleware'
import itemRouter from './routes/itemRouter'
import userRouter from './routes/userRouter'
import rentalRouter from './routes/rentalRouter'
import errorHandler from './middleware/errorhandler/errorhandler'
import { requestLogger } from './middleware/logger/httplogger'

const app = express()

const swaggerDocument = YAML.load('./../api/src/api.yaml')
app.use('/api-spec', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors())

app.use(fileUpload())
app.use(requestLogger)

// Set up middleware to protect the /protected route. This must come before routes.
app.use('/protected', checkJwt)

app.use('/api/', [rentalRouter()])

app.use('/api/', [itemRouter()])

app.use('/api/', [userRouter()])

app.get('/', (req: Request, res: Response) =>
  res.status(200).json({ msg: 'Hello World!' }),
)

app.use(errorHandler)

export default app
