import { beforeEach, describe, expect, it, vi } from "vitest"
import { IdosellDocument } from "../schemas/document"
import { DatabaseService } from "./database"
import { OrderWithDocuments } from "./orders"

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeOrder(
  serialNumber: number,
  overrides: Partial<OrderWithDocuments> = {},
): OrderWithDocuments {
  return {
    orderId: `order-${serialNumber}`,
    orderSerialNumber: serialNumber,
    orderType: "p",
    errors: [],
    orderDetails: {
      payments: {
        orderBaseCurrency: { orderProductsCost: 99.99 },
      },
    },
    clientResult: {},
    orderBridgeNote: "",
    documents: [],
    ...overrides,
  }
}

function makeSalesConfirmation(serialNumber: number): IdosellDocument {
  return {
    orderSerialNumber: serialNumber,
    documentType: "sales_confirmation",
    documentId: `SC-${serialNumber}`,
    documentName: `Potwierdzenie_sprzedazy_nr_${serialNumber}`,
    documentPurchaseDate: "2024-01-01",
    documentIssuedDate: "2024-01-02",
    pdfWithDocumentsInBase64: "base64pdf==",
  }
}

function makeVatInvoice(serialNumber: number, id: number): IdosellDocument {
  return {
    orderSerialNumber: serialNumber,
    documentType: "vat_invoice",
    id,
    documentId: `FV/2024/${id}`,
    documentName: `Faktura_VAT_${id}`,
    documentPurchaseDate: "2024-01-01",
    documentIssuedDate: "2024-01-02",
    orderPaymentDate: "2024-01-10",
    ksefNumber: "KSEF-123",
    ksefDocumentStatus: "completed",
    pdfWithDocumentsInBase64: "base64pdf==",
  }
}

// ---------------------------------------------------------------------------
// Mock DB builder
// ---------------------------------------------------------------------------

function makeMockDb() {
  const mockReturning = vi.fn()
  const mockOnConflictDoUpdate = vi
    .fn()
    .mockReturnValue({ returning: mockReturning })
  const mockValues = vi
    .fn()
    .mockReturnValue({ onConflictDoUpdate: mockOnConflictDoUpdate })
  const mockInsert = vi.fn().mockReturnValue({ values: mockValues })
  const mockFindMany = vi.fn()

  const db = {
    insert: mockInsert,
    query: {
      orders: { findMany: mockFindMany },
    },
  } as any

  return {
    db,
    mockInsert,
    mockValues,
    mockOnConflictDoUpdate,
    mockReturning,
    mockFindMany,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DatabaseService", () => {
  let mocks: ReturnType<typeof makeMockDb>
  let service: DatabaseService

  beforeEach(() => {
    mocks = makeMockDb()
    // Default: insert returns a valid upserted order row
    mocks.mockReturning.mockResolvedValue([{ id: 1 }])
    mocks.mockFindMany.mockResolvedValue([])
    service = new DatabaseService(mocks.db)
  })

  // -------------------------------------------------------------------------
  // upsertOrders — order insertion
  // -------------------------------------------------------------------------

  describe("upsertOrders() — order insertion", () => {
    it("inserts a new order with correct fields", async () => {
      const order = makeOrder(1)

      await service.upsertOrders([order])

      expect(mocks.mockInsert).toHaveBeenCalledWith(expect.anything())
      expect(mocks.mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: "order-1",
          orderSerialNumber: 1,
          productsCost: "99.99",
        }),
      )
    })

    it("calls insert once per order", async () => {
      await service.upsertOrders([makeOrder(1), makeOrder(2), makeOrder(3)])

      // Each order calls insert for itself plus up to 2 documents
      // The first call in each order's chain is for the order row itself
      expect(mocks.mockInsert).toHaveBeenCalledTimes(3)
    })

    it("uses onConflictDoUpdate targeting orderId", async () => {
      await service.upsertOrders([makeOrder(1)])

      expect(mocks.mockOnConflictDoUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          set: expect.objectContaining({ productsCost: "99.99" }),
        }),
      )
    })

    it("formats productsCost to 2 decimal places", async () => {
      const order = makeOrder(1, {
        orderDetails: {
          payments: { orderBaseCurrency: { orderProductsCost: 12.1 } },
        },
      })

      await service.upsertOrders([order])

      expect(mocks.mockValues).toHaveBeenCalledWith(
        expect.objectContaining({ productsCost: "12.10" }),
      )
    })

    it("falls back to productsCost '0.00' when orderDetails path is missing", async () => {
      const order = makeOrder(1, { orderDetails: {} })

      await service.upsertOrders([order])

      expect(mocks.mockValues).toHaveBeenCalledWith(
        expect.objectContaining({ productsCost: "0.00" }),
      )
    })

    it("resolves without error when ordersWithDocuments is empty", async () => {
      await expect(service.upsertOrders([])).resolves.toBeUndefined()
      expect(mocks.mockInsert).not.toHaveBeenCalled()
    })
  })

  // -------------------------------------------------------------------------
  // upsertOrders — document insertion
  // -------------------------------------------------------------------------

  describe("upsertOrders() — document insertion", () => {
    beforeEach(() => {
      // Restore full insert chain for document calls too
      mocks.mockReturning.mockResolvedValue([{ id: 42 }])
      mocks.mockInsert.mockReturnValue({ values: mocks.mockValues })
    })

    it("inserts a sales_confirmation document when present", async () => {
      const order = makeOrder(1, {
        documents: [makeSalesConfirmation(1)],
      })

      await service.upsertOrders([order])

      // insert called for: order + sales_confirmation = 2 times
      expect(mocks.mockInsert).toHaveBeenCalledTimes(2)
      expect(mocks.mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          documentId: "SC-1",
          documentName: "Potwierdzenie_sprzedazy_nr_1",
        }),
      )
    })

    it("inserts a vat_invoice document when present", async () => {
      const order = makeOrder(1, {
        documents: [makeVatInvoice(1, 99)],
      })

      await service.upsertOrders([order])

      expect(mocks.mockInsert).toHaveBeenCalledTimes(2)
      expect(mocks.mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          documentId: "FV/2024/99",
          ksefNumber: "KSEF-123",
          ksefDocumentStatus: "completed",
        }),
      )
    })

    it("inserts both document types when both are present", async () => {
      const order = makeOrder(1, {
        documents: [makeSalesConfirmation(1), makeVatInvoice(1, 99)],
      })

      await service.upsertOrders([order])

      // order + salesConfirmation + vatInvoice = 3 inserts
      expect(mocks.mockInsert).toHaveBeenCalledTimes(3)
    })

    it("skips salesConfirmation insert when documentId is missing", async () => {
      const doc: IdosellDocument = {
        orderSerialNumber: 1,
        documentType: "sales_confirmation",
        // no documentId
      }
      const order = makeOrder(1, { documents: [doc] })

      await service.upsertOrders([order])

      // Only the order itself is inserted
      expect(mocks.mockInsert).toHaveBeenCalledTimes(1)
    })

    it("skips vatInvoice insert when documentId is missing", async () => {
      const doc: IdosellDocument = {
        orderSerialNumber: 1,
        documentType: "vat_invoice",
        // no documentId
      }
      const order = makeOrder(1, { documents: [doc] })

      await service.upsertOrders([order])

      expect(mocks.mockInsert).toHaveBeenCalledTimes(1)
    })

    it("inserts no documents when documents array is empty", async () => {
      await service.upsertOrders([makeOrder(1)])

      expect(mocks.mockInsert).toHaveBeenCalledTimes(1)
    })
  })

  // -------------------------------------------------------------------------
  // getOrders
  // -------------------------------------------------------------------------

  describe("getOrders()", () => {
    it("calls findMany with ascending order by orderSerialNumber", async () => {
      await service.getOrders()

      expect(mocks.mockFindMany).toHaveBeenCalledOnce()
      expect(mocks.mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expect.anything(),
          with: expect.objectContaining({
            salesConfirmation: expect.anything(),
            vatInvoice: expect.anything(),
          }),
        }),
      )
    })

    it("excludes pdfWithDocumentsInBase64 by default (withPdf: false)", async () => {
      await service.getOrders()

      const call = mocks.mockFindMany.mock.calls[0][0]
      expect(call.with.salesConfirmation.columns).toEqual({
        pdfWithDocumentsInBase64: false,
      })
      expect(call.with.vatInvoice.columns).toEqual({
        pdfWithDocumentsInBase64: false,
      })
    })

    it("includes pdfWithDocumentsInBase64 when withPdf is true", async () => {
      await service.getOrders({ withPdf: true })

      const call = mocks.mockFindMany.mock.calls[0][0]
      expect(call.with.salesConfirmation.columns).toEqual({
        pdfWithDocumentsInBase64: true,
      })
      expect(call.with.vatInvoice.columns).toEqual({
        pdfWithDocumentsInBase64: true,
      })
    })

    it("returns whatever findMany resolves with", async () => {
      const row = { orderSerialNumber: 7, orderId: "order-7" }
      mocks.mockFindMany.mockResolvedValue([row])

      const result = await service.getOrders()

      expect(result).toEqual([row])
    })
  })
})
