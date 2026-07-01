import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { DATABASE_URL } from "../config/env"
import * as schema from "./schema"

const pool = new Pool({
  connectionString: DATABASE_URL,
})

export const db = drizzle({
  client: pool,
  schema,
})

export async function closeDbConnection(): Promise<void> {
  await pool.end()
}
