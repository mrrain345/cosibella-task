import { z } from "zod"
import {
  idosellDocumentSchema,
  idosellDocumentTypeSchema,
} from "../schemas/document"
import { IdosellClient, idosellClient } from "./idosell-client"

const documentsQuery = z.object({
  orderSerialNumber: z.number().int().positive(),
  documentType: idosellDocumentTypeSchema,
})

const documentsResponse = z.object({
  documents: z.array(idosellDocumentSchema),
})

export type IdosellDocumentsQuery = z.infer<typeof documentsQuery>
export type IdosellDocumentsResponse = z.infer<typeof documentsResponse>

/** IdoSell documents lookup endpoint. */
export class IdosellDocumentsModel {
  private _client: IdosellClient

  constructor(client: IdosellClient = idosellClient) {
    this._client = client
  }

  /** Get documents for a specific order. */
  async get(query: IdosellDocumentsQuery): Promise<IdosellDocumentsResponse> {
    const parsedQuery = documentsQuery.parse(query)

    const response = await this._client.request<unknown>({
      method: "GET",
      path: "/orders/documents",
      query: parsedQuery,
    })

    return documentsResponse.parse(response)
  }
}

/** Shared documents model instance wired to the default IdoSell client. */
export const idosellDocumentsModel = new IdosellDocumentsModel()
