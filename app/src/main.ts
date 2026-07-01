import { env } from "./config/env"
import { app } from "./app"
import { logger } from "./config/logger"
import { closeDbConnection } from "./db/client"

async function bootstrap() {
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`)
  })
}

void bootstrap().catch((err) => {
  logger.fatal(`Bootstrap failed: ${err}`)
  process.exit(1)
})

process.on("unhandledRejection", (reason, _promise) => {
  logger.fatal(`Unhandled Rejection: ${reason}`)
})

process.on("SIGTERM", async () => {
  await closeDbConnection()
  process.exit(0)
})

process.on("SIGINT", async () => {
  await closeDbConnection()
  process.exit(0)
})
