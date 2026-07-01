import { relations } from "drizzle-orm"
import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"

export const idosellDocumentTypeEnum = pgEnum("idosell_document_type", [
  "sales_confirmation",
  "vat_invoice",
])

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id", { length: 64 }).notNull().unique(),
  orderSerialNumber: integer("order_serial_number").notNull().unique(),
  productsCost: numeric("products_cost", { precision: 14, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  externalDocumentId: integer("external_document_id").notNull().unique(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  documentType: idosellDocumentTypeEnum("document_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const ordersRelations = relations(orders, ({ many }) => ({
  documents: many(documents),
}))

export const documentsRelations = relations(documents, ({ one }) => ({
  order: one(orders, {
    fields: [documents.orderId],
    references: [orders.id],
  }),
}))

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert

export type Document = typeof documents.$inferSelect
export type NewDocument = typeof documents.$inferInsert
