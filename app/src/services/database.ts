import { sql } from "drizzle-orm"
import { db } from "../db/client"
import { documents, orders, NewDocument, NewOrder } from "../db/schema"
import { IdosellDocument } from "../schemas/document"
import { OrderWithDocuments } from "./orders"

/** Service for persisting IdoSell orders and their documents to the database. */
export class DatabaseService {
  private _db: typeof db

  constructor(database: typeof db = db) {
    this._db = database
  }

  /** Upsert all orders and their associated documents. */
  async upsertOrders(ordersWithDocuments: OrderWithDocuments[]): Promise<void> {
    await Promise.all(
      ordersWithDocuments.map((order) => this._upsertOrder(order)),
    )
  }

  /** Upsert a single order along with its documents. */
  private async _upsertOrder(
    orderWithDocuments: OrderWithDocuments,
  ): Promise<void> {
    const newOrder: NewOrder = {
      orderId: orderWithDocuments.orderId,
      orderSerialNumber: orderWithDocuments.orderSerialNumber,
      productsCost: this._extractProductsCost(orderWithDocuments).toFixed(2),
    }

    const [upsertedOrder] = await this._db
      .insert(orders)
      .values(newOrder)
      .onConflictDoUpdate({
        target: orders.orderId,
        set: {
          productsCost: newOrder.productsCost,
          updatedAt: new Date(),
        },
      })
      .returning({ id: orders.id })

    if (orderWithDocuments.documents.length > 0) {
      await this._upsertDocuments(
        upsertedOrder.id,
        orderWithDocuments.documents,
      )
    }
  }

  /** Upsert documents for a given internal order ID. */
  private async _upsertDocuments(
    orderId: number,
    docs: IdosellDocument[],
  ): Promise<void> {
    const newDocuments: NewDocument[] = docs.map((doc) => ({
      externalDocumentId: doc.id,
      orderId,
      documentType: doc.documentType as "sales_confirmation" | "vat_invoice",
    }))

    await this._db
      .insert(documents)
      .values(newDocuments)
      .onConflictDoUpdate({
        target: documents.externalDocumentId,
        set: {
          orderId: sql`excluded.order_id`,
          documentType: sql`excluded.document_type`,
        },
      })
  }

  /** Extract the products cost from an IdoSell order. */
  private _extractProductsCost(order: OrderWithDocuments): number {
    return (
      order.orderDetails?.payments?.orderBaseCurrency?.orderProductsCost ?? 0
    )
  }
}

export const databaseService = new DatabaseService()
