import { BODY_TYPES, CONDITIONS, FUELS, TRANSMISSIONS } from "./constants";

export type VehicleFilters = {
  q?: string;
  marca?: string;
  condicion?: string;
  carroceria?: string;
  combustible?: string;
  transmision?: string;
  moneda?: "USD" | "ARS";
  precioMax?: number;
  anioMin?: number;
  kmMax?: number;
  orden: "recientes" | "precio-asc" | "precio-desc" | "km-asc" | "anio-desc";
};

type RawParams = Record<string, string | string[] | undefined>;

const ORDERS = ["recientes", "precio-asc", "precio-desc", "km-asc", "anio-desc"] as const;

function first(value: string | string[] | undefined) {
  const v = Array.isArray(value) ? value[0] : value;
  return v?.trim() || undefined;
}

function positiveInt(value: string | undefined) {
  if (!value) return undefined;
  const n = Number(value.replace(/\D/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function oneOf(value: string | undefined, allowed: Record<string, string>) {
  return value && value in allowed ? value : undefined;
}

/** Convierte los parámetros de la URL del catálogo en filtros validados. */
export function parseFilters(params: RawParams): VehicleFilters {
  const orden = first(params.orden);
  const moneda = first(params.moneda);
  return {
    q: first(params.q)?.slice(0, 60),
    marca: first(params.marca)?.slice(0, 40),
    condicion: oneOf(first(params.condicion), CONDITIONS),
    carroceria: oneOf(first(params.carroceria), BODY_TYPES),
    combustible: oneOf(first(params.combustible), FUELS),
    transmision: oneOf(first(params.transmision), TRANSMISSIONS),
    moneda: moneda === "ARS" || moneda === "USD" ? moneda : undefined,
    precioMax: positiveInt(first(params.precioMax)),
    anioMin: positiveInt(first(params.anioMin)),
    kmMax: positiveInt(first(params.kmMax)),
    orden: ORDERS.includes(orden as (typeof ORDERS)[number])
      ? (orden as VehicleFilters["orden"])
      : "recientes",
  };
}

export function hasActiveFilters(f: VehicleFilters) {
  return Object.entries(f).some(([k, v]) => k !== "orden" && v !== undefined);
}
