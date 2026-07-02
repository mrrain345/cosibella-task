import pino from "pino"
import { env } from "./env"
import { pinoHttp } from "pino-http"

const transport = pino.transport({
  target: "pino-http-print",
  options: {
    destination: 1,
    all: true,
    colorize: true,
    translateTime: true,
  },
})

export const logger = pino(env.LOG_FORMAT === "pretty" ? transport : undefined)

export const loggerHttp = pinoHttp({
  logger,
  quietReqLogger: true,
  customLogLevel(req, res, err) {
    if (res.statusCode >= 500 || err) return "error"
    if (res.statusCode >= 400) return "warn"
    return "info"
  },
})
