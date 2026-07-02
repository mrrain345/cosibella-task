import { IdosellDocument } from "../schemas/document"
import { IdosellOrder } from "../schemas/order"
import {
  idosellDocumentsModel,
  IdosellDocumentsModel,
} from "../models/idosell-documents"
import {
  idosellOrdersModel,
  IdosellOrdersModel,
} from "../models/idosell-orders"

const DOCUMENT_TYPES = ["sales_confirmation", "vat_invoice"] as const
const RESULTS_LIMIT = 100

export type OrderWithDocuments = IdosellOrder & {
  documents: IdosellDocument[]
}

/** Service for retrieving orders and their associated documents from IdoSell. */
export class OrdersService {
  private _ordersModel: IdosellOrdersModel
  private _documentsModel: IdosellDocumentsModel

  constructor(
    ordersModel: IdosellOrdersModel = idosellOrdersModel,
    documentsModel: IdosellDocumentsModel = idosellDocumentsModel,
  ) {
    this._ordersModel = ordersModel
    this._documentsModel = documentsModel
  }

  /** Retrieve all orders along with their associated documents. */
  async getAllOrders(): Promise<OrderWithDocuments[]> {
    const allOrders = await this._fetchAllOrderPages()
    return Promise.all(allOrders.map((order) => this._attachDocuments(order)))
  }

  /** Fetch a single page of orders from IdoSell. */
  private _fetchOrderPage(page: number) {
    return this._ordersModel.search({
      shippmentStatus: "all",
      resultsPage: page,
      resultsLimit: RESULTS_LIMIT,
    })
  }

  /** Fetch all pages of orders from IdoSell. */
  private async _fetchAllOrderPages(): Promise<IdosellOrder[]> {
    const firstPage = await this._fetchOrderPage(0)
    const totalPages = firstPage.resultsNumberPage

    if (totalPages <= 1) {
      return firstPage.Results
    }

    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        this._fetchOrderPage(i + 1),
      ),
    )

    return [
      ...firstPage.Results,
      ...remainingPages.flatMap((page) => page.Results),
    ]
  }

  /** Fetch all documents associated with a given order serial number. */
  private async _fetchDocuments(
    orderSerialNumber: number,
  ): Promise<IdosellDocument[]> {
    const results = await Promise.allSettled(
      DOCUMENT_TYPES.map((documentType) =>
        this._documentsModel.get({ orderSerialNumber, documentType }),
      ),
    )

    return results.flatMap((result) =>
      result.status === "fulfilled" ? result.value.documents : [],
    )
  }

  /** Attach documents to an order. */
  private async _attachDocuments(
    order: IdosellOrder,
  ): Promise<OrderWithDocuments> {
    const documents = await this._fetchDocuments(order.orderSerialNumber)
    return { ...order, documents }
  }
}

export const ordersService = new OrdersService()
