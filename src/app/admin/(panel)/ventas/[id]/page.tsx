import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deleteSale } from "@/app/admin/actions/sales";
import { ActionButton } from "@/components/admin/ActionButton";
import { PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import { requireUser } from "@/lib/auth";
import { PAYMENT_METHODS, label } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatDate, formatKm, formatPrice, vehicleTitle } from "@/lib/format";

export const metadata: Metadata = { title: "Venta" };

export default function SalePage({ params, searchParams }: PageProps<"/admin/ventas/[id]">) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <SaleDetail params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function SaleDetail({ params, searchParams }: PageProps<"/admin/ventas/[id]">) {
  const user = await requireUser();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const sale = await db.sale.findUnique({
    where: { id },
    include: { vehicle: true, customer: true, seller: { select: { name: true } } },
  });
  if (!sale) notFound();

  const rows: [string, React.ReactNode][] = [
    ["Fecha", formatDate(sale.date)],
    ["Precio final", <strong key="p">{formatPrice(sale.price, sale.currency)}</strong>],
    ["Forma de pago", label(PAYMENT_METHODS, sale.paymentMethod)],
    ["Usado recibido", sale.tradeIn ? `${sale.tradeIn}${sale.tradeInValue ? ` · ${formatPrice(sale.tradeInValue, sale.currency)}` : ""}` : "—"],
    ["Vendedor", sale.seller?.name ?? "—"],
  ];

  return (
    <>
      <PageHeader title={`Venta: ${vehicleTitle(sale.vehicle)} ${sale.vehicle.year}`}>
        {user.role === "ADMIN" && (
          <ActionButton
            action={deleteSale.bind(null, sale.id)}
            confirmText="¿Anular esta venta? El vehículo vuelve a quedar disponible."
            className="btn border border-brand-200 bg-white text-brand-700 hover:bg-brand-50"
            pendingText="Anulando…"
          >
            Anular venta
          </ActionButton>
        )}
      </PageHeader>
      {query.nueva && (
        <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          ¡Venta registrada! El vehículo quedó como vendido y ya no se muestra en la web.
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="mb-3 font-semibold">Operación</h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-slate-500">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {sale.notes && <p className="mt-4 whitespace-pre-line border-t border-slate-100 pt-4 text-sm">{sale.notes}</p>}
        </section>
        <div className="space-y-6">
          <section className="card space-y-1 p-5 text-sm">
            <h2 className="mb-2 font-semibold">Cliente</h2>
            <Link href={`/admin/clientes/${sale.customer.id}`} className="font-medium text-brand-600 hover:underline">{sale.customer.name}</Link>
            {sale.customer.phone && <p>{sale.customer.phone}</p>}
            {sale.customer.email && <p>{sale.customer.email}</p>}
            {sale.customer.dni && <p>DNI/CUIT: {sale.customer.dni}</p>}
          </section>
          <section className="card space-y-1 p-5 text-sm">
            <h2 className="mb-2 font-semibold">Vehículo</h2>
            <Link href={`/admin/vehiculos/${sale.vehicle.id}`} className="font-medium text-brand-600 hover:underline">
              {vehicleTitle(sale.vehicle)} {sale.vehicle.year}
            </Link>
            <p>{formatKm(sale.vehicle.km)}{sale.vehicle.color && ` · ${sale.vehicle.color}`}</p>
            <p className="text-slate-500">Precio publicado: {formatPrice(sale.vehicle.price, sale.vehicle.currency)}</p>
          </section>
        </div>
      </div>
    </>
  );
}
