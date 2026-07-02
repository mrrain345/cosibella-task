import { env } from "./config/env"
import { app } from "./app"
import { logger } from "./config/logger"
import { closeDbConnection } from "./db/client"
import { syncJob } from "./jobs/sync"

async function start() {
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`)
  })
  syncJob.start()
}

async function stop() {
  syncJob.stop()
  await closeDbConnection()
  process.exit(0)
}

void start().catch((err) => {
  logger.fatal(err, "Starting application failed")
  process.exit(1)
})

process.on("unhandledRejection", (reason, _promise) => {
  logger.fatal({ reason }, "Unhandled Rejection")
})

process.on("SIGTERM", () => void stop())
process.on("SIGINT", () => void stop())
