import "dotenv/config";
import { defineConfig } from "prisma/config";

// Use process.env (not env()) so `prisma generate` succeeds on Vercel/CI
// when only DATABASE_URL is set. Migrations locally should set DIRECT_URL (port 5432).
const datasourceUrl =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: datasourceUrl,
  },
});
