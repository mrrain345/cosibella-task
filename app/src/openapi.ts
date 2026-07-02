import { z } from "zod"
import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi"

extendZodWithOpenApi(z)

const registry = new OpenAPIRegistry()

// --- Schemas ---

const salesConfirmationSchema = registry.register(
  "SalesConfirmation",
  z.object({
    id: z.number().int(),
    orderSerialNumber: z.number().int(),
    documentId: z.string(),
    documentName: z.string().nullable(),
    documentPurchaseDate: z.string().nullable(),
    documentIssuedDate: z.string().nullable(),
    pdfWithDocumentsInBase64: z.string().nullable().optional(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  }),
)

const vatInvoiceSchema = registry.register(
  "VatInvoice",
  z.object({
    id: z.number().int(),
    orderSerialNumber: z.number().int(),
    documentId: z.string(),
    documentName: z.string().nullable(),
    documentPurchaseDate: z.string().nullable(),
    documentIssuedDate: z.string().nullable(),
    orderPaymentDate: z.string().nullable(),
    ksefNumber: z.string().nullable(),
    ksefDocumentStatus: z
      .enum(["pending", "processing", "completed", "failed", "skipped"])
      .nullable(),
    correctedInvoiceId: z.string().nullable(),
    pdfWithDocumentsInBase64: z.string().nullable().optional(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  }),
)

const orderSchema = registry.register(
  "Order",
  z.object({
    orderSerialNumber: z.number().int(),
    orderId: z.string(),
    productsCost: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    salesConfirmation: salesConfirmationSchema.nullable(),
    vatInvoice: vatInvoiceSchema.nullable(),
  }),
)

const updateCostBodySchema = z.object({
  productsCost: z
    .number()
    .nonnegative()
    .openapi({ description: "Products cost override (non-negative)" }),
})

const orderSerialNumberParam = z.object({
  orderSerialNumber: z.coerce
    .number()
    .int()
    .positive()
    .openapi({ description: "Order serial number" }),
})

const withPdfQuery = z.object({
  withPdf: z.boolean().optional().openapi({
    description: "Include base64-encoded PDF documents in the response",
  }),
})

// --- Paths ---

registry.registerPath({
  method: "get",
  path: "/api/orders",
  summary: "List all orders",
  description:
    "Returns all orders stored in the database along with their associated documents.",
  request: { query: withPdfQuery },
  responses: {
    200: {
      description: "List of orders with their associated documents",
      content: { "application/json": { schema: z.array(orderSchema) } },
    },
  },
})

registry.registerPath({
  method: "get",
  path: "/api/orders/{orderSerialNumber}",
  summary: "Get a single order",
  description: "Returns a single order by its serial number.",
  request: {
    params: orderSerialNumberParam,
    query: withPdfQuery,
  },
  responses: {
    200: {
      description: "The requested order with associated documents",
      content: { "application/json": { schema: orderSchema } },
    },
    404: { description: "Order not found" },
  },
})

registry.registerPath({
  method: "patch",
  path: "/api/orders/{orderSerialNumber}/cost",
  summary: "Update products cost (partial)",
  description: "Overrides the products cost for a given order.",
  request: {
    params: orderSerialNumberParam,
    body: {
      content: { "application/json": { schema: updateCostBodySchema } },
    },
  },
  responses: {
    204: { description: "Cost updated successfully" },
    400: { description: "Invalid request body or path parameters" },
    404: { description: "Order not found" },
  },
})

registry.registerPath({
  method: "put",
  path: "/api/orders/{orderSerialNumber}/cost",
  summary: "Update products cost",
  description: "Overrides the products cost for a given order.",
  request: {
    params: orderSerialNumberParam,
    body: {
      content: { "application/json": { schema: updateCostBodySchema } },
    },
  },
  responses: {
    204: { description: "Cost updated successfully" },
    400: { description: "Invalid request body or path parameters" },
    404: { description: "Order not found" },
  },
})

// --- Document generator ---

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions)
  return generator.generateDocument({
    openapi: "3.0.0",
    info: { title: "Cosibella Task API", version: "1.0.0" },
  })
}
