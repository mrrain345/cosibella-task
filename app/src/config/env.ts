import dotenv from "dotenv"
import { z } from "zod"

dotenv.config({
  path: ["../.env"],
  quiet: true,
})

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error"])
    .default("info"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  IDOSELL_DOMAIN: z.string().nonempty(),
  IDOSELL_API_KEY: z.string().nonempty(),
})

export const env = EnvSchema.parse(process.env)

export const DEVELOPMENT_MODE = env.NODE_ENV === "development"
export const PRODUCTION_MODE = env.NODE_ENV === "production"
