import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFoundHandler } from './middleware/notFoundHandler.js'
import documentRoutes from './routes/documentRoutes.js'

const app = express()

app.use(
  cors({
    origin: env.clientUrl,
  }),
)
app.use(express.json({ limit: '100kb' }))
app.use('/api/documents', documentRoutes)
app.use(notFoundHandler)
app.use(errorHandler)

export default app
