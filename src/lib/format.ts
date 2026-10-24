import { CURRENCIES, type Currency } from "./constants";

const numberFormat = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

export function formatPrice(price: number, currency: string): string {
  const symbol = CURRENCIES[currency as Currency] ?? currency;
  return `${symbol} ${numberFormat.format(price)}`;
}

export function formatKm(km: number): string {
  return km === 0 ? "0 km" : `${numberFormat.format(km)} km`;
}

export function vehicleTitle(v: { brand: string; model: string; version?: string | null }) {
  return [v.brand, v.model, v.version].filter(Boolean).join(" ");
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Pasa un celular argentino al formato internacional que pide WhatsApp (549 + área + número).
 * Acepta "11 5555-1234", "011 15 5555-1234", "+54 9 11 5555-1234", etc.
 * Los números que ya vienen con otro código de país se dejan como están.
 */
export function toWhatsappNumber(phone: string): string {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("549")) return d;
  if (d.startsWith("54") && d.length === 12) return `549${d.slice(2)}`;
  d = d.replace(/^0+/, "");
  // Sacar el "15" que va después del código de área (de 2 a 4 dígitos).
  if (d.length === 12) {
    for (const area of [2, 3, 4]) {
      if (d.slice(area, area + 2) === "15") {
        d = d.slice(0, area) + d.slice(area + 2);
        break;
      }
    }
  }
  return d.length === 10 ? `549${d}` : d;
}

export function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/${toWhatsappNumber(phone)}?text=${encodeURIComponent(message)}`;
}

/** URL de una foto: las de Vercel Blob ya son una URL completa; las locales se sirven por /api/fotos. */
export function imageUrl(storedPath: string) {
  return /^https?:\/\//.test(storedPath) ? storedPath : `/api/fotos/${storedPath}`;
}

export const TIME_ZONE = "America/Argentina/Buenos_Aires";

const dateFormat = new Intl.DateTimeFormat("es-AR", { timeZone: TIME_ZONE, dateStyle: "short" });
const dateTimeFormat = new Intl.DateTimeFormat("es-AR", {
  timeZone: TIME_ZONE,
  dateStyle: "short",
  timeStyle: "short",
});

export function formatDate(date: Date) {
  return dateFormat.format(date);
}

export function formatDateTime(date: Date) {
  return dateTimeFormat.format(date);
}

/** Fecha en Argentina como "AAAA-MM-DD" (sirve para inputs type="date"). */
export function isoDateInArgentina(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(date);
}

/** Rango [desde, hasta) de un mes "AAAA-MM", o null si el formato es inválido. */
export function monthRange(month: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return null;
  const year = Number(match[1]);
  const m = Number(match[2]);
  if (m < 1 || m > 12) return null;
  return { from: new Date(Date.UTC(year, m - 1, 1)), to: new Date(Date.UTC(year, m, 1)) };
}

export function formatMonth(month: string) {
  const range = monthRange(month);
  if (!range) return month;
  const text = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric", timeZone: "UTC" }).format(range.from);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Solo los dígitos de un teléfono, para comparar y armar links. */
export function phoneDigits(phone: string) {
  return phone.replace(/\D/g, "");
}
