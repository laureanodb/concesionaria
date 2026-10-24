import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Falta la variable DATABASE_URL");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

// Se reutiliza la instancia entre recargas (desarrollo) y entre pedidos de una misma función (Vercel).
export const db = globalForPrisma.prisma ?? createClient();
globalForPrisma.prisma = db;
