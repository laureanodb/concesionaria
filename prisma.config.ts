import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Las migraciones necesitan una conexión directa (o el pooler en modo "session", puerto 5432):
    // el modo "transaction" de Supabase no las soporta.
    url: process.env["DIRECT_URL"] || process.env["POSTGRES_URL_NON_POOLING"] || process.env["DATABASE_URL"],
  },
});
