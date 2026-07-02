import { Request, Response, NextFunction } from "express"
import { StatusCodes } from "http-status-codes"
import "../config/logger"
import z from "zod"
import { env } from "../config/env"

type HttpError = Error & { status?: number; statusCode?: number }

/**
 * Middleware for handling errors.
 * It logs the error and sends an error response to the client.
 */
export function errorHandler(
  err: HttpError,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status =
    err.status ?? err.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR

  const error = {
    status,
    name: err.name,
    message: prettifyZodError(err),
    cause: env.NODE_ENV === "development" ? err.cause : undefined,
  }

  req.log.error({
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    error: error,
  })

  res.status(status).send({ error })
}

/** Prettify Zod error messages for better readability. */
function prettifyZodError(error: Error): string {
  if (error instanceof z.ZodError) {
    return z.prettifyError(error)
  } else {
    return error.message
  }
}
