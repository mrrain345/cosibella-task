import { z } from "zod"

export const idosellDocumentTypeSchema = z.enum([
  "sales_confirmation",
  "vat_invoice",
  "corrective_vat_invoice",
  "advance_vat_invoice",
  "final_advance_vat_invoice",
  "pro_forma_invoice",
  "advance_pro_forma_invoice",
  "final_advance_pro_forma_invoice",
  "delivery_note",
  "fiscal_receipt",
  "fiscal_invoice",
  "other",
])

export const idosellKsefDocumentStatusSchema = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
  "skipped",
])

const idosellErrorSchema = z.object({
  faultCode: z.number(),
  faultString: z.string(),
})

export const idosellDocumentSchema = z.object({
  orderSerialNumber: z.number(),
  documentType: idosellDocumentTypeSchema,
  id: z.number().optional(),
  documentId: z.string().optional(),
  documentName: z.string().optional(),
  ksefNumber: z.string().optional(),
  ksefDocumentStatus: idosellKsefDocumentStatusSchema.optional(),
  pdfWithDocumentsInBase64: z.string().optional(),
  errors: idosellErrorSchema.optional(),
  documentPurchaseDate: z.string().optional(),
  documentIssuedDate: z.string().optional(),
  orderPaymentDate: z.string().optional(),
  documentData: z.string().optional(),
  correctedInvoiceId: z.string().optional(),
})

export type IdosellDocument = z.infer<typeof idosellDocumentSchema>
