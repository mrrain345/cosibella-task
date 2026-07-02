import { asc } from "drizzle-orm"
import { db } from "../db/client"
import {
  NewOrder,
  NewSalesConfirmation,
  NewVatInvoice,
  orders,
  salesConfirmations,
  vatInvoices,
} from "../db/schema"
import { IdosellDocument } from "../schemas/document"
import { OrderWithDocuments } from "./orders"

type GetOrdersOptions = {
  withPdf?: boolean
}

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
      .returning({ id: orders.orderSerialNumber })

    const salesConfirmation = orderWithDocuments.documents.find(
      (d) => d.documentType === "sales_confirmation",
    )
    const vatInvoice = orderWithDocuments.documents.find(
      (d) => d.documentType === "vat_invoice",
    )

    await Promise.all([
      salesConfirmation &&
        this._upsertSalesConfirmation(upsertedOrder.id, salesConfirmation),
      vatInvoice && this._upsertVatInvoice(upsertedOrder.id, vatInvoice),
    ])
  }

  /** Upsert a sales confirmation document for a given internal order ID. */
  private async _upsertSalesConfirmation(
    orderSerialNumber: number,
    doc: IdosellDocument,
  ): Promise<void> {
    if (!doc.documentId) return

    const values: NewSalesConfirmation = {
      orderSerialNumber,
      documentId: doc.documentId,
      documentName: doc.documentName ?? null,
      documentPurchaseDate: doc.documentPurchaseDate ?? null,
      documentIssuedDate: doc.documentIssuedDate ?? null,
      pdfWithDocumentsInBase64: doc.pdfWithDocumentsInBase64 ?? null,
    }

    await this._db
      .insert(salesConfirmations)
      .values(values)
      .onConflictDoUpdate({
        target: salesConfirmations.orderSerialNumber,
        set: {
          documentId: values.documentId,
          documentName: values.documentName,
          documentPurchaseDate: values.documentPurchaseDate,
          documentIssuedDate: values.documentIssuedDate,
          pdfWithDocumentsInBase64: values.pdfWithDocumentsInBase64,
          updatedAt: new Date(),
        },
      })
  }

  /** Upsert a VAT invoice document for a given internal order ID. */
  private async _upsertVatInvoice(
    orderSerialNumber: number,
    doc: IdosellDocument,
  ): Promise<void> {
    if (!doc.documentId) return

    const values: NewVatInvoice = {
      orderSerialNumber,
      documentId: doc.documentId,
      documentName: doc.documentName ?? null,
      documentPurchaseDate: doc.documentPurchaseDate ?? null,
      documentIssuedDate: doc.documentIssuedDate ?? null,
      orderPaymentDate: doc.orderPaymentDate ?? null,
      ksefNumber: doc.ksefNumber ?? null,
      ksefDocumentStatus: doc.ksefDocumentStatus ?? null,
      correctedInvoiceId: doc.correctedInvoiceId ?? null,
      pdfWithDocumentsInBase64: doc.pdfWithDocumentsInBase64 ?? null,
    }

    await this._db
      .insert(vatInvoices)
      .values(values)
      .onConflictDoUpdate({
        target: vatInvoices.orderSerialNumber,
        set: {
          documentId: values.documentId,
          documentName: values.documentName,
          documentPurchaseDate: values.documentPurchaseDate,
          documentIssuedDate: values.documentIssuedDate,
          orderPaymentDate: values.orderPaymentDate,
          ksefNumber: values.ksefNumber,
          ksefDocumentStatus: values.ksefDocumentStatus,
          correctedInvoiceId: values.correctedInvoiceId,
          pdfWithDocumentsInBase64: values.pdfWithDocumentsInBase64,
          updatedAt: new Date(),
        },
      })
  }

  /** Retrieve all orders with their associated documents from the database. */
  async getOrders(options: GetOrdersOptions = {}) {
    const { withPdf = false } = options

    return this._db.query.orders.findMany({
      with: {
        salesConfirmation: {
          columns: { pdfWithDocumentsInBase64: withPdf },
        },
        vatInvoice: {
          columns: { pdfWithDocumentsInBase64: withPdf },
        },
      },
      orderBy: asc(orders.orderSerialNumber),
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
