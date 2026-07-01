import { Request, Response, NextFunction } from "express"
import { StatusCodes } from "http-status-codes"

type HttpError = Error & { status?: number; statusCode?: number }

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
    message: err.message,
    cause: err.cause,
  }

  req.log.error({
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    error: error,
  })

  res.status(status).send({ error })
}
