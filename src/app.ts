import express from "express"
import cors from "cors"
import { loggerHttp } from "./config/logger"
import { notFoundHandler } from "./middlewares/not-found-handler"
import { errorHandler } from "./middlewares/error-handler"

import { main } from "./routes/main"

export const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(loggerHttp)

// Routes
app.use(main)

// Error Handlers
app.use(notFoundHandler)
app.use(errorHandler)
