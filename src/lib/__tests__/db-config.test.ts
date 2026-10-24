import { afterEach, describe, expect, it, vi } from "vitest";
import { databaseConfig } from "../db-config";

afterEach(() => vi.unstubAllEnvs());

describe("databaseConfig", () => {
  it("usa SSL sin validar la cadena y limpia parámetros de Prisma para Supabase", () => {
    vi.stubEnv("DATABASE_URL", "postgresql://postgres.abc:clave@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require");
    const config = databaseConfig();
    expect(config.connectionString).toBe("postgresql://postgres.abc:clave@aws-0-sa-east-1.pooler.supabase.com:6543/postgres");
    expect(config.ssl).toEqual({ rejectUnauthorized: false });
  });

  it("no fuerza SSL en una base local", () => {
    vi.stubEnv("DATABASE_URL", "postgresql://postgres@localhost:5433/laureano");
    expect(databaseConfig().ssl).toBeUndefined();
  });

  it("acepta la variable de la integración Supabase-Vercel", () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("POSTGRES_PRISMA_URL", "postgres://postgres.abc:x@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x");
    expect(databaseConfig().connectionString).toBe("postgres://postgres.abc:x@aws-0-sa-east-1.pooler.supabase.com:6543/postgres");
  });

  it("avisa si falta la conexión", () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("POSTGRES_PRISMA_URL", "");
    expect(() => databaseConfig()).toThrow("DATABASE_URL");
  });
});
