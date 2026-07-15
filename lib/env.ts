import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const LIBSQL_REGEX = /^libsql:\/\//;

export const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  server: {
    DATABASE_URL: z.string().min(1),
  },
  client: {},
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
  },
  emptyStringAsUndefined: true,
});
