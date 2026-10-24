export const SITE_NAME = "Automotores Laureano";

export const ROLES = { ADMIN: "Administrador", VENDEDOR: "Vendedor" } as const;
export type Role = keyof typeof ROLES;

export const CURRENCIES = { USD: "US$", ARS: "$" } as const;
export type Currency = keyof typeof CURRENCIES;

export const CONDITIONS = { NUEVO: "0 km", USADO: "Usado" } as const;
export type Condition = keyof typeof CONDITIONS;

export const STATUSES = {
  DISPONIBLE: "Disponible",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
} as const;
export type Status = keyof typeof STATUSES;

export const FUELS = {
  NAFTA: "Nafta",
  DIESEL: "Diésel",
  GNC: "Nafta/GNC",
  HIBRIDO: "Híbrido",
  ELECTRICO: "Eléctrico",
} as const;

export const TRANSMISSIONS = { MANUAL: "Manual", AUTOMATICA: "Automática" } as const;

export const BODY_TYPES = {
  SEDAN: "Sedán",
  HATCHBACK: "Hatchback",
  SUV: "SUV",
  PICKUP: "Pick-up",
  UTILITARIO: "Utilitario",
  COUPE: "Coupé",
  RURAL: "Rural",
} as const;

export const CONTACT = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491100000000",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "(011) 0000-0000",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "ventas@automotoreslaureano.com.ar",
  address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? "Av. Siempre Viva 1234, Buenos Aires",
  hours: "Lunes a viernes de 9 a 19 h · Sábados de 9 a 13 h",
};

export function label<T extends Record<string, string>>(map: T, key: string): string {
  return (map as Record<string, string>)[key] ?? key;
}

export const LEAD_TYPES = { CONSULTA: "Consulta", TEST_DRIVE: "Test drive" } as const;

export const LEAD_SOURCES = {
  WEB: "Web",
  WHATSAPP: "WhatsApp",
  TELEFONO: "Teléfono",
  PRESENCIAL: "Presencial",
} as const;

export const LEAD_STATUSES = {
  NUEVO: "Nueva",
  CONTACTADO: "Contactada",
  CERRADO: "Cerrada",
  DESCARTADO: "Descartada",
} as const;

export const PAYMENT_METHODS = {
  CONTADO: "Contado",
  FINANCIADO: "Financiado",
  MIXTO: "Mixto (parte usado / financiado)",
} as const;
