"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { customerSchema, fieldErrors, formValues } from "@/lib/validation";

export type CustomerFormState = { errors?: Record<string, string>; message?: string; values?: Record<string, string> };

const FIELDS = ["name", "phone", "email", "dni", "address", "notes"] as const;

export async function saveCustomer(
  customerId: string | null,
  _prev: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  await requireUser();
  const values = formValues(formData, FIELDS);
  const parsed = customerSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values, message: "Revisá los campos marcados" };

  if (customerId) {
    await db.customer.update({ where: { id: customerId }, data: parsed.data });
    refresh();
    return { message: "Cambios guardados" };
  }
  const customer = await db.customer.create({ data: parsed.data });
  redirect(`/admin/clientes/${customer.id}`);
}

export async function deleteCustomer(customerId: string) {
  const user = await requireUser();
  if (user.role !== "ADMIN") return { error: "Solo un administrador puede eliminar clientes" };
  const sales = await db.sale.count({ where: { customerId } });
  if (sales > 0) return { error: "No se puede eliminar: el cliente tiene ventas registradas" };
  await db.customer.delete({ where: { id: customerId } });
  redirect("/admin/clientes");
}
