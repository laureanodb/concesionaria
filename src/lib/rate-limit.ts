import "server-only";
import { headers } from "next/headers";
import { db } from "./db";

// Los intentos se guardan en la base de datos para que el límite valga en todas
// las instancias del servidor (en Vercel cada pedido puede caer en una distinta).

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

/** true si la clave ya alcanzó el límite de intentos en la ventana de tiempo. */
export async function isRateLimited(key: string, limit: number, windowMs: number) {
  const since = new Date(Date.now() - windowMs);
  const hits = await db.rateLimitHit.count({ where: { key, createdAt: { gte: since } } });
  return hits >= limit;
}

export async function recordHit(key: string) {
  await db.rateLimitHit.create({ data: { key } });
  // De vez en cuando se borran los registros viejos para que la tabla no crezca.
  if (Math.random() < 0.02) {
    await db.rateLimitHit.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
  }
}

export async function clearHits(key: string) {
  await db.rateLimitHit.deleteMany({ where: { key } });
}
