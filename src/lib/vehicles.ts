import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import type { VehicleFilters } from "./filters";
import { imageUrl } from "./format";

/** Tag de caché de todo lo que muestra la web pública. Se invalida al modificar el stock. */
export const VEHICLES_TAG = "vehiculos";

const publicWhere = {
  published: true,
  status: { not: "VENDIDO" },
} satisfies Prisma.VehicleWhereInput;

const cardSelect = {
  id: true,
  slug: true,
  brand: true,
  model: true,
  version: true,
  year: true,
  km: true,
  price: true,
  currency: true,
  condition: true,
  fuel: true,
  transmission: true,
  status: true,
  images: { orderBy: { position: "asc" }, take: 1, select: { path: true } },
} satisfies Prisma.VehicleSelect;

type CardRow = Prisma.VehicleGetPayload<{ select: typeof cardSelect }>;

function toCard({ images, ...v }: CardRow) {
  return { ...v, cover: images[0] ? imageUrl(images[0].path) : null };
}

export type VehicleCard = ReturnType<typeof toCard>;

function buildWhere(f: VehicleFilters): Prisma.VehicleWhereInput {
  const and: Prisma.VehicleWhereInput[] = [publicWhere];
  if (f.q) {
    and.push({
      OR: [
        { brand: { contains: f.q, mode: "insensitive" } },
        { model: { contains: f.q, mode: "insensitive" } },
        { version: { contains: f.q, mode: "insensitive" } },
      ],
    });
  }
  if (f.marca) and.push({ brand: f.marca });
  if (f.condicion) and.push({ condition: f.condicion });
  if (f.carroceria) and.push({ bodyType: f.carroceria });
  if (f.combustible) and.push({ fuel: f.combustible });
  if (f.transmision) and.push({ transmission: f.transmision });
  if (f.anioMin) and.push({ year: { gte: f.anioMin } });
  if (f.kmMax) and.push({ km: { lte: f.kmMax } });
  if (f.moneda) and.push({ currency: f.moneda });
  if (f.precioMax) and.push({ price: { lte: f.precioMax } });
  return { AND: and };
}

const ORDER_BY: Record<VehicleFilters["orden"], Prisma.VehicleOrderByWithRelationInput[]> = {
  recientes: [{ createdAt: "desc" }],
  "precio-asc": [{ price: "asc" }],
  "precio-desc": [{ price: "desc" }],
  "km-asc": [{ km: "asc" }],
  "anio-desc": [{ year: "desc" }, { createdAt: "desc" }],
};

export async function searchVehicles(filters: VehicleFilters) {
  "use cache";
  cacheLife("hours");
  cacheTag(VEHICLES_TAG);

  const rows = await db.vehicle.findMany({
    where: buildWhere(filters),
    orderBy: ORDER_BY[filters.orden],
    select: cardSelect,
  });
  return rows.map(toCard);
}

export async function getFeaturedVehicles(limit = 6) {
  "use cache";
  cacheLife("hours");
  cacheTag(VEHICLES_TAG);

  const featured = await db.vehicle.findMany({
    where: { ...publicWhere, featured: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: cardSelect,
  });
  // Si no hay suficientes destacados se completa con los últimos ingresos.
  const latest =
    featured.length < limit
      ? await db.vehicle.findMany({
          where: { ...publicWhere, id: { notIn: featured.map((v) => v.id) } },
          orderBy: { createdAt: "desc" },
          take: limit - featured.length,
          select: cardSelect,
        })
      : [];
  return [...featured, ...latest].map(toCard);
}

export async function getBrands() {
  "use cache";
  cacheLife("hours");
  cacheTag(VEHICLES_TAG);

  const rows = await db.vehicle.findMany({
    where: publicWhere,
    distinct: ["brand"],
    orderBy: { brand: "asc" },
    select: { brand: true },
  });
  return rows.map((r) => r.brand);
}

export async function getPublicVehicle(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(VEHICLES_TAG);

  const vehicle = await db.vehicle.findFirst({
    where: { slug, published: true },
    include: { images: { orderBy: { position: "asc" } } },
  });
  if (!vehicle) return null;
  const { images, ...rest } = vehicle;
  return { ...rest, images: images.map((img) => ({ id: img.id, url: imageUrl(img.path) })) };
}

export type PublicVehicle = NonNullable<Awaited<ReturnType<typeof getPublicVehicle>>>;

export async function getSitemapVehicles() {
  "use cache";
  cacheLife("hours");
  cacheTag(VEHICLES_TAG);

  return db.vehicle.findMany({
    where: publicWhere,
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}
