import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["typthm"],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
