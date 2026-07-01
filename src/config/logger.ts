import pino from "pino"
import { DEVELOPMENT_MODE } from "./env"
import { pinoHttp } from "pino-http"

const transport = pino.transport({
  target: "pino-http-print",
  options: {
    destination: 1,
    all: true,
    colorize: process.stdout.isTTY,
    translateTime: true,
  },
})

export const logger = pino(DEVELOPMENT_MODE ? transport : undefined)

export const loggerHttp = pinoHttp({
  logger,
  quietReqLogger: true,
  customLogLevel(req, res, err) {
    if (res.statusCode >= 500 || err) return "error"
    if (res.statusCode >= 400) return "warn"
    return "info"
  },
})
