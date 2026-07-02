import dotenv from "dotenv"
import { z } from "zod"

dotenv.config({
  path: ["../.env"],
  quiet: true,
})

const EnvSchema = z
  .object({
    DOCKER: z.coerce.boolean().default(false),
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    LOG_LEVEL: z
      .enum(["trace", "debug", "info", "warn", "error"])
      .default("info"),
    LOG_FORMAT: z.enum(["pretty", "json"]).default("pretty"),

    IDOSELL_DOMAIN: z.string().nonempty(),
    IDOSELL_API_KEY: z.string().nonempty(),
    IDOSELL_SYNC_INTERVAL_SEC: z.coerce.number().int().positive().default(300),

    POSTGRES_USER: z.string().nonempty(),
    POSTGRES_PASSWORD: z.string().nonempty(),
    POSTGRES_HOST: z.string().nonempty(),
    POSTGRES_PORT: z.coerce.number().int().positive(),
    POSTGRES_DB: z.string().nonempty(),
  })
  .transform((data) => ({
    ...data,
    // When not running inside Docker, connect to Postgres on localhost instead.
    POSTGRES_HOST: data.DOCKER ? data.POSTGRES_HOST : "localhost",
  }))

export const env = EnvSchema.parse(process.env)
export const DATABASE_URL = `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`
