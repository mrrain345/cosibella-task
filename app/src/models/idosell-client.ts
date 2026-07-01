import { env } from "../config/env"
import { HttpError } from "http-errors-enhanced"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
type QueryValue = string | number | boolean | null

type Options = {
  path: string
  method: HttpMethod
  query?: Record<string, QueryValue>
  body?: object
}

const API_BASE_URL = `https://${env.IDOSELL_DOMAIN}/api/admin/v8`

export async function idosellRequest<T = unknown>(
  options: Options,
): Promise<T> {
  const { path, method, query, body } = options

  const url = new URL(`${API_BASE_URL}${path}`)
  if (query) {
    url.search = new URLSearchParams(query as Record<string, string>).toString()
  }

  const response = await fetch(url, {
    method,
    headers: {
      "X-API-KEY": env.IDOSELL_API_KEY,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json()
  if (!response.ok) throw new HttpError(response.status, data)
  return data as T
}
