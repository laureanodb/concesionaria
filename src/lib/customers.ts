import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import { phoneDigits } from "./format";

type Client = Prisma.TransactionClient | typeof db;

/** Primer nombre sin acentos ni mayúsculas, para comparar. */
export function firstName(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase().split(/\s+/)[0] ?? "";
}

/**
 * Busca un cliente por teléfono o email y, si no existe, lo crea.
 * Así una misma persona que consulta varias veces queda en una sola ficha.
 * Con el teléfono además tiene que coincidir el nombre: en una familia suelen compartir número.
 */
export async function findOrCreateCustomer(
  data: { name: string; phone: string | null; email: string | null },
  client: Client = db,
) {
  const digits = data.phone ? phoneDigits(data.phone) : "";
  const or: Prisma.CustomerWhereInput[] = [];
  if (digits.length >= 6) or.push({ phone: { endsWith: digits.slice(-8) } });
  if (data.email) or.push({ email: data.email });

  if (or.length > 0) {
    const candidates = await client.customer.findMany({ where: { OR: or }, take: 10 });
    const match = candidates.find(
      (c) =>
        (data.email && c.email === data.email) ||
        (digits &&
          c.phone &&
          phoneDigits(c.phone).slice(-8) === digits.slice(-8) &&
          firstName(c.name) === firstName(data.name)),
    );
    if (match) return match;
  }
  return client.customer.create({ data });
}
