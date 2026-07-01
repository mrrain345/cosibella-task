import { z } from "zod"

import { idosellRequest } from "./idosell-client"
import { idosellOrderSchema } from "../schemas/order"

const searchParams = z.object({
  shippmentStatus: z.enum(["all", "received", "non-received"]).optional(),
  resultsLimit: z.number().int().positive().optional(),
  resultsPage: z.number().int().nonnegative().optional(),
})

const searchResponse = z.object({
  Results: z.array(idosellOrderSchema),
  resultsNumberAll: z.number(),
  resultsNumberPage: z.number(),
  resultsLimit: z.number(),
  resultsPage: z.number(),
})

export type IdosellOrdersSearchParams = z.infer<typeof searchParams>
export type IdosellOrdersSearchResponse = z.infer<typeof searchResponse>

export async function searchIdosellOrders(
  params: IdosellOrdersSearchParams,
): Promise<IdosellOrdersSearchResponse> {
  const parsedParams = searchParams.parse(params)

  const response = await idosellRequest({
    path: "/orders/orders/search",
    method: "POST",
    body: { params: parsedParams },
  })

  return searchResponse.parse(response)
}
