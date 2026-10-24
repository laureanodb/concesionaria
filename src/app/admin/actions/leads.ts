"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { findOrCreateCustomer } from "@/lib/customers";
import { db } from "@/lib/db";
import { adminLeadSchema, fieldErrors, formValues, leadUpdateSchema } from "@/lib/validation";

export type AdminLeadState = { errors?: Record<string, string>; message?: string; values?: Record<string, string> };

const NEW_FIELDS = ["type", "source", "name", "phone", "email", "message", "preferredDate", "vehicleId", "assignedToId"] as const;

export async function createLead(_prev: AdminLeadState, formData: FormData): Promise<AdminLeadState> {
  const user = await requireUser();
  const values = formValues(formData, NEW_FIELDS);
  const parsed = adminLeadSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const lead = await db.lead.create({
    data: { ...parsed.data, assignedToId: parsed.data.assignedToId ?? user.id, status: "NUEVO" },
  });
  redirect(`/admin/consultas/${lead.id}`);
}

export type LeadUpdateState = { message?: string; errors?: Record<string, string> };

export async function updateLead(leadId: string, _prev: LeadUpdateState, formData: FormData): Promise<LeadUpdateState> {
  await requireUser();
  const parsed = leadUpdateSchema.safeParse(formValues(formData, ["status", "assignedToId", "notes"]));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  await db.lead.update({ where: { id: leadId }, data: parsed.data });
  refresh();
  return { message: "Cambios guardados" };
}

/** Atajo desde la bandeja: pasa una consulta nueva a "contactada" y la asigna a quien la atiende. */
export async function markLeadContacted(leadId: string) {
  const user = await requireUser();
  const lead = await db.lead.findUniqueOrThrow({ where: { id: leadId }, select: { assignedToId: true } });
  await db.lead.update({
    where: { id: leadId },
    data: { status: "CONTACTADO", assignedToId: lead.assignedToId ?? user.id },
  });
  refresh();
}

/** Crea (o reutiliza) la ficha de cliente con los datos de la consulta. */
export async function linkLeadToCustomer(leadId: string) {
  await requireUser();
  const lead = await db.lead.findUniqueOrThrow({ where: { id: leadId } });
  const customer = await findOrCreateCustomer({ name: lead.name, phone: lead.phone, email: lead.email });
  await db.lead.update({ where: { id: leadId }, data: { customerId: customer.id } });
  refresh();
}

export async function deleteLead(leadId: string) {
  const user = await requireUser();
  if (user.role !== "ADMIN") return;
  await db.lead.delete({ where: { id: leadId } });
  redirect("/admin/consultas");
}
