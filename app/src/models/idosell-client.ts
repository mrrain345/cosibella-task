import { env } from "../config/env"
import { HttpError } from "http-errors-enhanced"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
type QueryValue = string | number | boolean | null
type QueryType = Record<string, QueryValue>

/** Options for making an HTTP request to the IdoSell API. */
type Options = {
  path: string
  method: HttpMethod
  query?: QueryType
  body?: object
}

/** IdoSell API client */
export class IdosellClient {
  private _apiBaseUrl: string
  private _apiKey: string

  constructor(
    apiBaseUrl = `https://${env.IDOSELL_DOMAIN}/api/admin/v8`,
    apiKey = env.IDOSELL_API_KEY,
  ) {
    this._apiBaseUrl = apiBaseUrl
    this._apiKey = apiKey
  }

  /**
   * Make an HTTP request to the IdoSell API with the given options,
   * and return the parsed JSON response.
   */
  async request<T = unknown>(options: Options): Promise<T> {
    const { path, method, query, body } = options

    const url = new URL(`${this._apiBaseUrl}${path}`)
    if (query) {
      url.search = new URLSearchParams(
        query as Record<string, string>,
      ).toString()
    }

    const response = await fetch(url, {
      method,
      headers: {
        "X-API-KEY": this._apiKey,
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await response.json()
    if (!response.ok) throw new HttpError(response.status, data)
    return data as T
  }
}

/** Shared default client bound to the configured IdoSell credentials. */
export const idosellClient = new IdosellClient()
