import { relations } from "drizzle-orm"
import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"

export const ksefDocumentStatusEnum = pgEnum("ksef_document_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "skipped",
])

export const orders = pgTable("orders", {
  orderSerialNumber: integer("order_serial_number").primaryKey(),
  orderId: varchar("order_id", { length: 64 }).notNull().unique(),
  productsCost: numeric("products_cost", { precision: 14, scale: 2 }).notNull(),
  productsCostOverride: numeric("products_cost_override", {
    precision: 14,
    scale: 2,
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export const salesConfirmations = pgTable("sales_confirmations", {
  id: serial("id").primaryKey(),
  orderSerialNumber: integer("order_serial_number")
    .notNull()
    .references(() => orders.orderSerialNumber, { onDelete: "cascade" })
    .unique(),
  documentId: varchar("document_id", { length: 128 }).notNull(),
  documentName: varchar("document_name", { length: 256 }),
  documentPurchaseDate: varchar("document_purchase_date", { length: 32 }),
  documentIssuedDate: varchar("document_issued_date", { length: 32 }),
  pdfWithDocumentsInBase64: text("pdf_with_documents_in_base64"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export const vatInvoices = pgTable("vat_invoices", {
  id: serial("id").primaryKey(),
  orderSerialNumber: integer("order_serial_number")
    .notNull()
    .references(() => orders.orderSerialNumber, { onDelete: "cascade" })
    .unique(),
  documentId: varchar("document_id", { length: 128 }).notNull().unique(),
  documentName: varchar("document_name", { length: 256 }),
  documentPurchaseDate: varchar("document_purchase_date", { length: 32 }),
  documentIssuedDate: varchar("document_issued_date", { length: 32 }),
  orderPaymentDate: varchar("order_payment_date", { length: 32 }),
  ksefNumber: varchar("ksef_number", { length: 256 }),
  ksefDocumentStatus: ksefDocumentStatusEnum("ksef_document_status"),
  correctedInvoiceId: varchar("corrected_invoice_id", { length: 128 }),
  pdfWithDocumentsInBase64: text("pdf_with_documents_in_base64"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export const ordersRelations = relations(orders, ({ one }) => ({
  salesConfirmation: one(salesConfirmations, {
    fields: [orders.orderSerialNumber],
    references: [salesConfirmations.orderSerialNumber],
  }),
  vatInvoice: one(vatInvoices, {
    fields: [orders.orderSerialNumber],
    references: [vatInvoices.orderSerialNumber],
  }),
}))

export const salesConfirmationsRelations = relations(
  salesConfirmations,
  ({ one }) => ({
    order: one(orders, {
      fields: [salesConfirmations.orderSerialNumber],
      references: [orders.orderSerialNumber],
    }),
  }),
)

export const vatInvoicesRelations = relations(vatInvoices, ({ one }) => ({
  order: one(orders, {
    fields: [vatInvoices.orderSerialNumber],
    references: [orders.orderSerialNumber],
  }),
}))

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert

export type SalesConfirmation = typeof salesConfirmations.$inferSelect
export type NewSalesConfirmation = typeof salesConfirmations.$inferInsert

export type VatInvoice = typeof vatInvoices.$inferSelect
export type NewVatInvoice = typeof vatInvoices.$inferInsert
