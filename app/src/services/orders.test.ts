import { beforeEach, describe, expect, it, vi } from "vitest"
import { IdosellDocumentsModel } from "../models/idosell-documents"
import { IdosellOrdersModel } from "../models/idosell-orders"
import { IdosellDocument } from "../schemas/document"
import { IdosellOrder } from "../schemas/order"
import { OrdersService } from "./orders"

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeOrder(serialNumber: number): IdosellOrder {
  return {
    errors: [],
    orderId: `order-${serialNumber}`,
    orderSerialNumber: serialNumber,
    orderType: "p",
    orderDetails: {},
    clientResult: {},
    orderBridgeNote: "",
  }
}

function makeSearchPage(
  orders: IdosellOrder[],
  totalPages = 1,
  page = 0,
  total?: number,
) {
  return {
    Results: orders,
    resultsNumberPage: totalPages,
    resultsNumberAll: total ?? orders.length,
    resultsLimit: 100,
    resultsPage: page,
  }
}

/** A valid sales_confirmation document — no `id` field, matching real API. */
function makeSalesConfirmation(serialNumber: number): {
  documents: IdosellDocument[]
} {
  return {
    documents: [
      {
        orderSerialNumber: serialNumber,
        documentType: "sales_confirmation",
        documentId: String(serialNumber),
        documentName: `Potwierdzenie_sprzedazy_nr_${serialNumber}`,
      },
    ],
  }
}

/** A valid vat_invoice document — has `id` field, matching real API. */
function makeVatInvoice(
  serialNumber: number,
  id: number,
): { documents: IdosellDocument[] } {
  return {
    documents: [
      {
        orderSerialNumber: serialNumber,
        documentType: "vat_invoice",
        id,
        documentId: `FV/2024/${id}`,
      },
    ],
  }
}

/** Error document response returned by IdoSell when no document of that type exists (HTTP 207). */
function makeDocumentError(
  serialNumber: number,
  documentType: "sales_confirmation" | "vat_invoice",
): { documents: IdosellDocument[] } {
  return {
    documents: [
      {
        orderSerialNumber: serialNumber,
        documentType,
        errors: {
          faultCode: 7,
          faultString: "Nie znaleziono żadnych wystawionych dokumentów",
        },
      },
    ],
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("OrdersService", () => {
  let ordersModel: { search: ReturnType<typeof vi.fn> }
  let documentsModel: { get: ReturnType<typeof vi.fn> }
  let service: OrdersService

  beforeEach(() => {
    ordersModel = { search: vi.fn() }
    documentsModel = { get: vi.fn() }
    service = new OrdersService(
      ordersModel as unknown as IdosellOrdersModel,
      documentsModel as unknown as IdosellDocumentsModel,
    )
  })

  // -------------------------------------------------------------------------
  // Pagination
  // -------------------------------------------------------------------------

  describe("getAllOrders() — pagination", () => {
    it("fetches a single page when resultsNumberPage is 1", async () => {
      ordersModel.search.mockResolvedValue(makeSearchPage([makeOrder(1)], 1))
      documentsModel.get.mockResolvedValue({ documents: [] })

      await service.getAllOrders()

      expect(ordersModel.search).toHaveBeenCalledOnce()
      expect(ordersModel.search).toHaveBeenCalledWith(
        expect.objectContaining({ resultsPage: 0 }),
      )
    })

    it("fetches all pages when resultsNumberPage > 1", async () => {
      ordersModel.search
        .mockResolvedValueOnce(makeSearchPage([makeOrder(1)], 3, 0, 3))
        .mockResolvedValueOnce(makeSearchPage([makeOrder(2)], 3, 1, 3))
        .mockResolvedValueOnce(makeSearchPage([makeOrder(3)], 3, 2, 3))
      documentsModel.get.mockResolvedValue({ documents: [] })

      const result = await service.getAllOrders()

      expect(ordersModel.search).toHaveBeenCalledTimes(3)
      expect(result).toHaveLength(3)
    })

    it("returns all orders from every page", async () => {
      const page0Orders = [makeOrder(1), makeOrder(2)]
      const page1Orders = [makeOrder(3)]

      ordersModel.search
        .mockResolvedValueOnce(makeSearchPage(page0Orders, 2, 0, 3))
        .mockResolvedValueOnce(makeSearchPage(page1Orders, 2, 1, 3))
      documentsModel.get.mockResolvedValue({ documents: [] })

      const result = await service.getAllOrders()

      expect(result.map((o) => o.orderSerialNumber)).toEqual([1, 2, 3])
    })

    it("returns an empty array when there are no orders", async () => {
      ordersModel.search.mockResolvedValue(makeSearchPage([], 0, 0, 0))

      const result = await service.getAllOrders()

      expect(result).toEqual([])
    })
  })

  // -------------------------------------------------------------------------
  // Document fetching
  // -------------------------------------------------------------------------

  describe("getAllOrders() — document fetching", () => {
    beforeEach(() => {
      ordersModel.search.mockResolvedValue(makeSearchPage([makeOrder(10)]))
    })

    it("fetches both sales_confirmation and vat_invoice for each order", async () => {
      documentsModel.get.mockResolvedValue({ documents: [] })

      await service.getAllOrders()

      expect(documentsModel.get).toHaveBeenCalledTimes(2)
      expect(documentsModel.get).toHaveBeenCalledWith(
        expect.objectContaining({
          documentType: "sales_confirmation",
          orderSerialNumber: 10,
        }),
      )
      expect(documentsModel.get).toHaveBeenCalledWith(
        expect.objectContaining({
          documentType: "vat_invoice",
          orderSerialNumber: 10,
        }),
      )
    })

    it("attaches sales_confirmation document (no id field) to the order", async () => {
      documentsModel.get
        .mockResolvedValueOnce(makeSalesConfirmation(10))
        .mockResolvedValueOnce({ documents: [] })

      const [order] = await service.getAllOrders()

      expect(order.documents).toHaveLength(1)
      expect(order.documents[0].documentType).toBe("sales_confirmation")
    })

    it("attaches vat_invoice document (with id field) to the order", async () => {
      documentsModel.get
        .mockResolvedValueOnce({ documents: [] })
        .mockResolvedValueOnce(makeVatInvoice(10, 999))

      const [order] = await service.getAllOrders()

      expect(order.documents).toHaveLength(1)
      expect(order.documents[0].documentType).toBe("vat_invoice")
    })

    it("attaches both document types when both exist", async () => {
      documentsModel.get
        .mockResolvedValueOnce(makeSalesConfirmation(10))
        .mockResolvedValueOnce(makeVatInvoice(10, 999))

      const [order] = await service.getAllOrders()

      expect(order.documents).toHaveLength(2)
      const types = order.documents.map((d) => d.documentType)
      expect(types).toContain("sales_confirmation")
      expect(types).toContain("vat_invoice")
    })

    it("filters out error documents (faultCode > 0) returned inside the documents array", async () => {
      documentsModel.get
        .mockResolvedValueOnce(makeSalesConfirmation(10))
        .mockResolvedValueOnce(makeDocumentError(10, "vat_invoice"))

      const [order] = await service.getAllOrders()

      expect(order.documents).toHaveLength(1)
      expect(order.documents[0].documentType).toBe("sales_confirmation")
    })

    it("returns empty documents when all responses contain errors", async () => {
      documentsModel.get
        .mockResolvedValueOnce(makeDocumentError(10, "sales_confirmation"))
        .mockResolvedValueOnce(makeDocumentError(10, "vat_invoice"))

      const [order] = await service.getAllOrders()

      expect(order.documents).toHaveLength(0)
    })

    it("handles a rejected document fetch gracefully, keeping the other type", async () => {
      documentsModel.get
        .mockResolvedValueOnce(makeSalesConfirmation(10))
        .mockRejectedValueOnce(new Error("Network error"))

      const [order] = await service.getAllOrders()

      expect(order.documents).toHaveLength(1)
      expect(order.documents[0].documentType).toBe("sales_confirmation")
    })

    it("returns empty documents when all document fetches are rejected", async () => {
      documentsModel.get.mockRejectedValue(new Error("API error"))

      const [order] = await service.getAllOrders()

      expect(order.documents).toHaveLength(0)
    })
  })
})
