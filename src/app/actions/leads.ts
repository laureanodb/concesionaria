"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { fieldErrors, formValues, publicLeadSchema } from "@/lib/validation";

export type LeadFormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

const FIELDS = ["type", "name", "phone", "email", "message", "preferredDate", "vehicleId"] as const;

/** Formulario público de consulta / test drive. */
export async function submitLead(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  // Campo trampa: las personas no lo ven, los bots lo completan.
  if (String(formData.get("website") ?? "") !== "") return { ok: true };

  const values = formValues(formData, FIELDS);
  const parsed = publicLeadSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  // Solo cuentan los envíos válidos: así un error de tipeo no bloquea a nadie.
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`lead:${ip}`, 5, 10 * 60 * 1000)) {
    return { message: "Recibimos varias consultas seguidas. Probá de nuevo en unos minutos o escribinos por WhatsApp.", values };
  }

  const data = parsed.data;
  if (data.vehicleId) {
    const exists = await db.vehicle.findFirst({ where: { id: data.vehicleId, published: true }, select: { id: true } });
    if (!exists) data.vehicleId = null;
  }
  if (data.type === "TEST_DRIVE" && !data.vehicleId) data.type = "CONSULTA";

  await db.lead.create({ data: { ...data, source: "WEB" } });
  return {
    ok: true,
    message:
      data.type === "TEST_DRIVE"
        ? "¡Listo! Te vamos a contactar para coordinar el test drive."
        : "¡Gracias! Recibimos tu consulta y te respondemos a la brevedad.",
  };
}
