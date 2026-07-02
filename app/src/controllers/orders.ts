import { Request, Response } from "express"
import { DatabaseService, databaseService } from "../services/database"
import z from "zod"

/** Query param to include PDF documents in the response. */
const withPdfSchema = z.object({
  withPdf: z.stringbool().default(false),
})

/** Path param for orderSerialNumber in the request URL. */
const pathParamsSchema = z.object({
  orderSerialNumber: z.coerce.number().int().positive(),
})

/** Request body for updating the products cost of a single order. */
const updateCostBodySchema = z.object({
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
    const parseResult = withPdfSchema.safeParse(req.query)

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

  /** Handle `GET /api/orders/:orderSerialNumber` to retrieve a single order. */
  getSingleOrder = async (req: Request, res: Response): Promise<void> => {
    const paramsResult = pathParamsSchema.safeParse(req.params)
    if (!paramsResult.success) {
      res.status(400).json({
        error: "Invalid path parameters",
        details: z.prettifyError(paramsResult.error),
      })
      return
    }

    const parseResult = withPdfSchema.safeParse(req.query)
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid query parameters",
        details: z.prettifyError(parseResult.error),
      })
      return
    }

    const { orderSerialNumber } = paramsResult.data
    const { withPdf } = parseResult.data
    const order = await this._databaseService.getOrder(orderSerialNumber, {
      withPdf,
    })

    if (!order) {
      res.status(404).json({ error: "Order not found" })
      return
    }

    res.json(order)
  }

  /** Handle `PATCH /api/orders/:orderSerialNumber/cost` to update products cost. */
  updateProductsCost = async (req: Request, res: Response): Promise<void> => {
    const paramsResult = pathParamsSchema.safeParse(req.params)
    if (!paramsResult.success) {
      res.status(400).json({
        error: "Invalid path parameters",
        details: z.prettifyError(paramsResult.error),
      })
      return
    }

    const bodyResult = updateCostBodySchema.safeParse(req.body)
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
