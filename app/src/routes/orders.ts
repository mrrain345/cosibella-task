import { Router } from "express"
import { ordersController } from "../controllers/orders"

export const ordersRouter = Router()

ordersRouter.get("/api/orders", ordersController.getOrders)

ordersRouter.get(
  "/api/orders/:orderSerialNumber",
  ordersController.getSingleOrder,
)

ordersRouter.patch(
  "/api/orders/:orderSerialNumber/cost",
  ordersController.updateProductsCost,
)
