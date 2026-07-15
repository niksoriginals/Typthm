import { integer, pgSchema, text } from "drizzle-orm/pg-core";

export const typthmSchema = pgSchema("typthm");

export const stats = typthmSchema.table("stats", {
  key: text("key").primaryKey(),
  value: integer("value").notNull().default(0),
});
