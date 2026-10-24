import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import { SaleForm } from "@/components/admin/SaleForm";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice, isoDateInArgentina, vehicleTitle } from "@/lib/format";

export const metadata: Metadata = { title: "Registrar venta" };

export default function NewSalePage({ searchParams }: PageProps<"/admin/ventas/nueva">) {
  return (
    <>
      <PageHeader title="Registrar venta" />
      <Suspense fallback={<PanelSkeleton />}>
        <NewSale searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function NewSale({ searchParams }: Pick<PageProps<"/admin/ventas/nueva">, "searchParams">) {
  await requireUser();
  const { vehiculo, cliente } = await searchParams;
  const [vehicles, customers] = await Promise.all([
    db.vehicle.findMany({
      where: { status: { not: "VENDIDO" } },
      orderBy: [{ brand: "asc" }, { model: "asc" }],
      select: { id: true, brand: true, model: true, version: true, year: true, price: true, currency: true },
    }),
    db.customer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, phone: true } }),
  ]);
  const vehicleId = typeof vehiculo === "string" && vehicles.some((v) => v.id === vehiculo) ? vehiculo : "";
  const customerId = typeof cliente === "string" && customers.some((c) => c.id === cliente) ? cliente : "";

  if (vehicles.length === 0) {
    return <p className="card p-6 text-slate-600">No hay vehículos disponibles para vender.</p>;
  }
  return (
    <SaleForm
      vehicles={vehicles.map((v) => ({
        id: v.id,
        label: `${vehicleTitle(v)} ${v.year} · ${formatPrice(v.price, v.currency)}`,
        price: v.price,
        currency: v.currency,
      }))}
      customers={customers.map((c) => [c.id, c.phone ? `${c.name} · ${c.phone}` : c.name])}
      defaults={{ vehicleId, customerId, date: isoDateInArgentina(new Date()) }}
    />
  );
}
