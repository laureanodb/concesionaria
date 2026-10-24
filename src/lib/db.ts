import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { databaseConfig } from "./db-config";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  return new PrismaClient({ adapter: new PrismaPg(databaseConfig()) });
}

// Se reutiliza la instancia entre recargas (desarrollo) y entre pedidos de una misma función (Vercel).
export const db = globalForPrisma.prisma ?? createClient();
globalForPrisma.prisma = db;
