import { Request, Response } from "express"
import { DatabaseService, databaseService } from "../services/database"
import z from "zod"

const getOrdersParams = z.object({
  withPdf: z.stringbool().default(false),
})

const updateOrderParams = z.object({
  orderSerialNumber: z.coerce.number().int().positive(),
})

const updateOrderBody = z.object({
  productsCost: z
    .number()
    .nonnegative()
    .transform((v) => v.toFixed(2)),
})

/** Controller for handling order-related HTTP requests. */
export class OrdersController {
  private _databaseService: DatabaseService

  constructor(_databaseService: DatabaseService = databaseService) {
    this._databaseService = _databaseService
  }

  /** Handle `GET /api/orders` request to retrieve all orders with their documents. */
  getOrders = async (req: Request, res: Response): Promise<void> => {
    const parseResult = getOrdersParams.safeParse(req.query)

    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid query parameters",
        details: z.prettifyError(parseResult.error),
      })
      return
    }

    const { withPdf } = parseResult.data
    const orders = await this._databaseService.getOrders({ withPdf })
    res.json(orders)
  }

  /** Handle `PATCH/PUT /api/orders/:orderSerialNumber/cost` to update products cost. */
  updateProductsCost = async (req: Request, res: Response): Promise<void> => {
    const paramsResult = updateOrderParams.safeParse(req.params)
    if (!paramsResult.success) {
      res.status(400).json({
        error: "Invalid path parameters",
        details: z.prettifyError(paramsResult.error),
      })
      return
    }

    const bodyResult = updateOrderBody.safeParse(req.body)
    if (!bodyResult.success) {
      res.status(400).json({
        error: "Invalid request body",
        details: z.prettifyError(bodyResult.error),
      })
      return
    }

    const { orderSerialNumber } = paramsResult.data
    const { productsCost } = bodyResult.data

    const found = await this._databaseService.updateProductsCost(
      orderSerialNumber,
      productsCost,
    )

    if (!found) {
      res.status(404).json({ error: "Order not found" })
      return
    }

    res.status(200).json({ orderSerialNumber, productsCost })
  }
}

export const ordersController = new OrdersController()
