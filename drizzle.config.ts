import { type Config } from "drizzle-kit"

import { env } from "@/env.mjs"

export default {
  schema: "./server/db/schema.ts",
  driver: "pg",
  out: "./drizzle",
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
  tablesFilter: ["calorie-counting_*"],
} satisfies Config
