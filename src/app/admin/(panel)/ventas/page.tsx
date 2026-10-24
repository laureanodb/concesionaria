import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import { requireUser } from "@/lib/auth";
import { PAYMENT_METHODS, label } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatDate, formatMonth, formatPrice, isoDateInArgentina, monthRange, vehicleTitle } from "@/lib/format";

export const metadata: Metadata = { title: "Ventas" };

export default function SalesPage({ searchParams }: PageProps<"/admin/ventas">) {
  return (
    <>
      <PageHeader title="Ventas">
        <Link href="/admin/ventas/nueva" className="btn-primary">+ Registrar venta</Link>
      </PageHeader>
      <Suspense fallback={<PanelSkeleton />}>
        <SalesList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function SalesList({ searchParams }: Pick<PageProps<"/admin/ventas">, "searchParams">) {
  await requireUser();
  const { mes } = await searchParams;
  const currentMonth = isoDateInArgentina(new Date()).slice(0, 7);
  const month = typeof mes === "string" && monthRange(mes) ? mes : currentMonth;
  const range = monthRange(month)!;

  const sales = await db.sale.findMany({
    where: { date: { gte: range.from, lt: range.to } },
    orderBy: { date: "desc" },
    include: {
      vehicle: { select: { brand: true, model: true, version: true, year: true } },
      customer: { select: { id: true, name: true } },
      seller: { select: { name: true } },
    },
  });

  const totals = new Map<string, number>();
  for (const s of sales) totals.set(s.currency, (totals.get(s.currency) ?? 0) + s.price);

  return (
    <div className="space-y-4">
      <Form action="/admin/ventas" className="card flex flex-wrap items-end gap-3 p-3">
        <div>
          <label htmlFor="mes" className="field-label">Mes</label>
          <input id="mes" name="mes" type="month" defaultValue={month} className="input" />
        </div>
        <button className="btn-dark">Ver</button>
      </Form>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-slate-500">Ventas en {formatMonth(month)}</p>
          <p className="text-3xl font-bold">{sales.length}</p>
        </div>
        {[...totals].map(([currency, total]) => (
          <div key={currency} className="card p-5">
            <p className="text-sm text-slate-500">Facturado en {currency === "USD" ? "dólares" : "pesos"}</p>
            <p className="text-2xl font-bold">{formatPrice(total, currency)}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase">
            <tr>
              <th className="p-3">Fecha</th>
              <th className="p-3">Vehículo</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Vendedor</th>
              <th className="p-3">Pago</th>
              <th className="p-3 text-right">Precio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="p-3 whitespace-nowrap">{formatDate(s.date)}</td>
                <td className="p-3">
                  <Link href={`/admin/ventas/${s.id}`} className="font-medium hover:text-brand-600">
                    {vehicleTitle(s.vehicle)} {s.vehicle.year}
                  </Link>
                  {s.tradeIn && <span className="block text-xs text-slate-500">Recibe: {s.tradeIn}</span>}
                </td>
                <td className="p-3"><Link href={`/admin/clientes/${s.customer.id}`} className="hover:text-brand-600">{s.customer.name}</Link></td>
                <td className="p-3">{s.seller?.name ?? "—"}</td>
                <td className="p-3">{label(PAYMENT_METHODS, s.paymentMethod).split(" (")[0]}</td>
                <td className="p-3 text-right font-semibold whitespace-nowrap">{formatPrice(s.price, s.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sales.length === 0 && <p className="p-6 text-center text-slate-500">No hay ventas registradas en este mes.</p>}
      </div>
    </div>
  );
}
