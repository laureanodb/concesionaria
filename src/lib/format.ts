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

export function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export function imageUrl(relativePath: string) {
  return `/api/fotos/${relativePath}`;
}
