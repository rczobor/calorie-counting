import { type Config } from "drizzle-kit"

import { env } from "@/env.mjs"

export default {
  schema: "./server/db/schema.ts",
  driver: "mysql2",
  dbCredentials: {
    uri: env.DATABASE_URL,
  },
  tablesFilter: ["calorie-counting_*"],
} satisfies Config
