"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { findOrCreateCustomer } from "@/lib/customers";
import { db } from "@/lib/db";
import { VEHICLES_TAG } from "@/lib/vehicles";
import { customerSchema, fieldErrors, formValues, saleSchema } from "@/lib/validation";

export type SaleFormState = { errors?: Record<string, string>; message?: string; values?: Record<string, string> };

const SALE_FIELDS = ["vehicleId", "customerId", "date", "price", "currency", "paymentMethod", "tradeIn", "tradeInValue", "notes"] as const;
const NEW_CUSTOMER_FIELDS = ["customerName", "customerPhone", "customerEmail", "customerDni"] as const;

export async function createSale(_prev: SaleFormState, formData: FormData): Promise<SaleFormState> {
  const user = await requireUser();
  const values = formValues(formData, [...SALE_FIELDS, ...NEW_CUSTOMER_FIELDS]);
  const parsed = saleSchema.safeParse(values);
  const errors = parsed.success ? {} : fieldErrors(parsed.error);

  // Cliente: uno existente o uno nuevo cargado en el mismo formulario.
  let newCustomer: { name: string; phone: string | null; email: string | null; dni: string | null } | null = null;
  if (!values.customerId) {
    const c = customerSchema.safeParse({
      name: values.customerName,
      phone: values.customerPhone,
      email: values.customerEmail,
      dni: values.customerDni,
      address: "",
      notes: "",
    });
    if (c.success) {
      newCustomer = { name: c.data.name, phone: c.data.phone, email: c.data.email, dni: c.data.dni };
    } else {
      for (const [k, msg] of Object.entries(fieldErrors(c.error))) {
        errors[`customer${k.charAt(0).toUpperCase()}${k.slice(1)}`] ??= msg;
      }
    }
  }
  if (!parsed.success || Object.keys(errors).length > 0) {
    return { errors, values, message: "Revisá los campos marcados" };
  }
  const data = parsed.data;

  const vehicle = await db.vehicle.findUnique({ where: { id: data.vehicleId }, select: { status: true } });
  if (!vehicle) return { errors: { vehicleId: "El vehículo no existe" }, values };
  if (vehicle.status === "VENDIDO") return { errors: { vehicleId: "Este vehículo ya figura como vendido" }, values };

  const sale = await db.$transaction(async (tx) => {
    let customerId = data.customerId;
    if (!customerId && newCustomer) {
      const customer = await findOrCreateCustomer(newCustomer, tx);
      if (newCustomer.dni && !customer.dni) {
        await tx.customer.update({ where: { id: customer.id }, data: { dni: newCustomer.dni } });
      }
      customerId = customer.id;
    }
    const created = await tx.sale.create({
      data: {
        vehicleId: data.vehicleId,
        customerId: customerId!,
        sellerId: user.id,
        // Mediodía UTC: queda en el mismo día en Argentina.
        date: new Date(`${data.date}T12:00:00Z`),
        price: data.price,
        currency: data.currency,
        paymentMethod: data.paymentMethod,
        tradeIn: data.tradeIn,
        tradeInValue: data.tradeInValue,
        notes: data.notes,
      },
    });
    await tx.vehicle.update({ where: { id: data.vehicleId }, data: { status: "VENDIDO" } });
    // Las consultas abiertas de este cliente por este auto quedan cerradas.
    await tx.lead.updateMany({
      where: { vehicleId: data.vehicleId, customerId, status: { in: ["NUEVO", "CONTACTADO"] } },
      data: { status: "CERRADO" },
    });
    return created;
  });

  updateTag(VEHICLES_TAG);
  redirect(`/admin/ventas/${sale.id}?nueva=1`);
}

/** Anula una venta (solo administradores): el auto vuelve a estar disponible. */
export async function deleteSale(saleId: string) {
  const user = await requireUser();
  if (user.role !== "ADMIN") return { error: "Solo un administrador puede anular ventas" };
  await db.$transaction(async (tx) => {
    const sale = await tx.sale.delete({ where: { id: saleId } });
    const others = await tx.sale.count({ where: { vehicleId: sale.vehicleId } });
    if (others === 0) {
      await tx.vehicle.update({ where: { id: sale.vehicleId }, data: { status: "DISPONIBLE" } });
    }
  });
  updateTag(VEHICLES_TAG);
  redirect("/admin/ventas");
}
