import { Router } from "express"
import { ordersController } from "../controllers/orders"

export const ordersRouter = Router()

ordersRouter.get("/api/orders", ordersController.getOrders)
