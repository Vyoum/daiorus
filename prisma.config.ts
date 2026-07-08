import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Prisma CLI (migrate / db push) needs a non-transaction-pooler connection
  datasource: {
    url: env("DIRECT_URL"),
  },
});
