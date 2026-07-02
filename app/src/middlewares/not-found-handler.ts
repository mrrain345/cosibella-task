import { Request, Response } from "express"
import { StatusCodes, ReasonPhrases } from "http-status-codes"
import "../config/logger"

/** Middleware for handling 404 Not Found errors. */
export function notFoundHandler(req: Request, res: Response) {
  let error = {
    status: StatusCodes.NOT_FOUND,
    message: ReasonPhrases.NOT_FOUND,
  }

  req.log.warn({
    url: req.originalUrl,
    method: req.method,
    error: error,
  })

  res.status(StatusCodes.NOT_FOUND).send({ error })
}
