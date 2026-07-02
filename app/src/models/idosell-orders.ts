import { z } from "zod"

import { IdosellClient, idosellClient } from "./idosell-client"
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

/** IdoSell orders search endpoint. */
export class IdosellOrdersModel {
  private _client: IdosellClient

  constructor(client: IdosellClient = idosellClient) {
    this._client = client
  }

  /** Search for orders using the specified parameters. */
  async search(
    params: IdosellOrdersSearchParams,
  ): Promise<IdosellOrdersSearchResponse> {
    const parsedParams = searchParams.parse(params)

    const response = await this._client.request({
      method: "POST",
      path: "/orders/orders/search",
      body: { params: parsedParams },
    })

    return searchResponse.parse(response)
  }
}

/** Shared orders model instance wired to the default IdoSell client. */
export const idosellOrdersModel = new IdosellOrdersModel()
