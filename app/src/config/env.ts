import dotenv from "dotenv"
import { z } from "zod"

dotenv.config({
  path: ["../.env"],
  quiet: true,
})

const EnvSchema = z.object({
  DOCKER: z.coerce.boolean().default(false),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error"])
    .default("info"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  IDOSELL_DOMAIN: z.string().nonempty(),
  IDOSELL_API_KEY: z.string().nonempty(),

  POSTGRES_USER: z.string().nonempty(),
  POSTGRES_PASSWORD: z.string().nonempty(),
  POSTGRES_HOST: z.string().nonempty(),
  POSTGRES_PORT: z.coerce.number().int().positive(),
  POSTGRES_DB: z.string().nonempty(),
})

export const env = EnvSchema.parse(process.env)

export const DEVELOPMENT_MODE = env.NODE_ENV === "development"
export const PRODUCTION_MODE = env.NODE_ENV === "production"
export const TEST_MODE = env.NODE_ENV === "test"

if (!env.DOCKER) env.POSTGRES_HOST = "localhost"
export const DATABASE_URL = `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`
