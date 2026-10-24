import type { PoolConfig } from "pg";

/**
 * Configuración de conexión a PostgreSQL para la web (y el seed).
 *
 * En Supabase, DATABASE_URL es la del pooler en modo "transaction" (puerto 6543), que es la
 * indicada para Vercel. También se aceptan las variables que crea la integración de Supabase
 * con Vercel (POSTGRES_PRISMA_URL).
 */
export function databaseConfig(): PoolConfig {
  const raw = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
  if (!raw) throw new Error("Falta la variable DATABASE_URL");

  const url = new URL(raw);
  // Parámetros que entienden Prisma o libpq pero no el driver de Node.
  for (const param of ["sslmode", "pgbouncer", "connection_limit", "supa"]) url.searchParams.delete(param);

  const isSupabase = /\.supabase\.(co|com)$/.test(url.hostname);
  return {
    connectionString: url.toString(),
    // Supabase usa SSL con un certificado propio que Node no reconoce: la conexión va cifrada
    // sin validar la cadena del certificado (lo mismo que hace libpq con sslmode=require).
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
  };
}
