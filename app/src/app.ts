import express from "express"
import cors from "cors"
import swaggerUi from "swagger-ui-express"
import { loggerHttp } from "./config/logger"
import { notFoundHandler } from "./middlewares/not-found-handler"
import { errorHandler } from "./middlewares/error-handler"

import { mainRouter } from "./routes/main"
import { ordersRouter } from "./routes/orders"
import { generateOpenApiDocument } from "./openapi"

export const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(loggerHttp)

// Routes
app.use(mainRouter)
app.use(ordersRouter)

// Swagger UI
const openApiDocument = generateOpenApiDocument()
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument))
app.get("/docs.json", (_req, res) => res.json(openApiDocument))

// Error Handlers
app.use(notFoundHandler)
app.use(errorHandler)
