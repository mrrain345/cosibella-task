import { z } from "zod"
import {
  idosellDocumentSchema,
  idosellDocumentTypeSchema,
} from "../schemas/document"
import { idosellRequest } from "./idosell-client"

const documentsQuery = z.object({
  orderSerialNumber: z.number().int().positive(),
  documentType: idosellDocumentTypeSchema,
})

const documentsResponse = z.object({
  documents: z.array(idosellDocumentSchema),
})

export type IdosellDocumentsQuery = z.infer<typeof documentsQuery>
export type IdosellDocumentsResponse = z.infer<typeof documentsResponse>

export async function getIdosellDocuments(
  query: IdosellDocumentsQuery,
): Promise<IdosellDocumentsResponse> {
  const parsedQuery = documentsQuery.parse(query)

  const response = await idosellRequest<unknown>({
    path: "/orders/documents",
    method: "GET",
    query: parsedQuery,
  })

  return documentsResponse.parse(response)
}
