import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations + introspection use the direct (non-pooler) URL.
    // Runtime queries go through the pooler via @prisma/adapter-pg in lib/db.ts.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
