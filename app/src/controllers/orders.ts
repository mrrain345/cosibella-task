import { Request, Response } from "express"
import { DatabaseService, databaseService } from "../services/database"
import z from "zod"

const getOrdersParams = z.object({
  withPdf: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
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
}

export const ordersController = new OrdersController()
