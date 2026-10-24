import { z } from "zod";
import { BODY_TYPES, CONDITIONS, CURRENCIES, FUELS, ROLES, STATUSES, TRANSMISSIONS } from "./constants";

const keys = <T extends Record<string, string>>(map: T) =>
  Object.keys(map) as [keyof T & string, ...(keyof T & string)[]];

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .transform((v) => (v === "" ? null : v));

// Acepta "15.500.000" o "15500000" desde el formulario.
const integer = (message: string) =>
  z
    .string()
    .trim()
    .transform((v) => v.replace(/[.\s]/g, ""))
    .pipe(z.string().regex(/^\d+$/, message))
    .transform(Number);

export const vehicleSchema = z
  .object({
    brand: z.string().trim().min(1, "Ingresá la marca").max(40),
    model: z.string().trim().min(1, "Ingresá el modelo").max(60),
    version: optionalText(80),
    year: integer("Año inválido").pipe(
      z
        .number()
        .min(1950, "Año inválido")
        .refine((y) => y <= new Date().getFullYear() + 1, "Año inválido"),
    ),
    km: integer("Kilometraje inválido").pipe(z.number().max(2_000_000, "Kilometraje inválido")),
    price: integer("Precio inválido").pipe(z.number().positive("Ingresá el precio")),
    currency: z.enum(keys(CURRENCIES)),
    condition: z.enum(keys(CONDITIONS)),
    fuel: z.enum(keys(FUELS)),
    transmission: z.enum(keys(TRANSMISSIONS)),
    bodyType: z.enum(keys(BODY_TYPES)),
    color: optionalText(30),
    doors: z
      .string()
      .trim()
      .transform((v) => (v === "" ? null : Number(v)))
      .pipe(z.number().int().min(2).max(5).nullable()),
    description: optionalText(3000),
    status: z.enum(keys(STATUSES)),
    published: z.boolean(),
    featured: z.boolean(),
  })
  .refine((v) => v.condition !== "NUEVO" || v.km <= 1000, {
    message: "Un 0 km no puede tener más de 1.000 km",
    path: ["km"],
  });

export type VehicleInput = z.infer<typeof vehicleSchema>;

const TEXT_FIELDS = [
  "brand", "model", "version", "year", "km", "price", "currency", "condition",
  "fuel", "transmission", "bodyType", "color", "doors", "description", "status",
] as const;

export function vehicleFormValues(formData: FormData) {
  const values: Record<string, unknown> = {};
  for (const field of TEXT_FIELDS) values[field] = String(formData.get(field) ?? "");
  values.published = formData.get("published") === "on";
  values.featured = formData.get("featured") === "on";
  return values;
}

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(1, "Ingresá la contraseña"),
});

export const userSchema = z.object({
  name: z.string().trim().min(2, "Ingresá el nombre").max(60),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(100),
  role: z.enum(keys(ROLES)),
});

/** Primer mensaje de error por campo, para mostrar en el formulario. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
