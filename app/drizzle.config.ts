import { defineConfig } from "drizzle-kit"
import dotenv from "dotenv"

dotenv.config({
  path: "../.env",
  quiet: true,
})

if (process.env.DOCKER !== "true") {
  process.env.POSTGRES_HOST = "localhost"
}

const databaseUrl =
  process.env.DATABASE_URL ??
  `postgresql://${process.env.POSTGRES_USER ?? "masterborn"}:${process.env.POSTGRES_PASSWORD ?? "masterborn"}@${process.env.POSTGRES_HOST ?? "localhost"}:${process.env.POSTGRES_PORT ?? "5432"}/${process.env.POSTGRES_DB ?? "masterborn"}`

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
})
