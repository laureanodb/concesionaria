import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deleteCustomer } from "@/app/admin/actions/customers";
import { ActionButton } from "@/components/admin/ActionButton";
import { LeadStatusBadge, LeadTypeBadge } from "@/components/admin/Badges";
import { CustomerForm } from "@/components/admin/CustomerForm";
import { PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatPrice, vehicleTitle, whatsappLink } from "@/lib/format";

export const metadata: Metadata = { title: "Cliente" };

export default function CustomerPage({ params }: PageProps<"/admin/clientes/[id]">) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <CustomerDetail params={params} />
    </Suspense>
  );
}

const vehicleSelect = { select: { id: true, brand: true, model: true, version: true, year: true } } as const;

async function CustomerDetail({ params }: Pick<PageProps<"/admin/clientes/[id]">, "params">) {
  const user = await requireUser();
  const { id } = await params;
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      leads: { orderBy: { createdAt: "desc" }, include: { vehicle: vehicleSelect } },
      sales: { orderBy: { date: "desc" }, include: { vehicle: vehicleSelect } },
    },
  });
  if (!customer) notFound();

  return (
    <>
      <PageHeader title={customer.name}>
        {customer.phone && (
          <a href={whatsappLink(customer.phone, `Hola ${customer.name.split(" ")[0]}, te escribo de Automotores Laureano.`)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            WhatsApp
          </a>
        )}
        <Link href={`/admin/ventas/nueva?cliente=${customer.id}`} className="btn-dark">Registrar venta</Link>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <CustomerForm
          customerId={customer.id}
          defaults={{
            name: customer.name,
            phone: customer.phone ?? "",
            email: customer.email ?? "",
            dni: customer.dni ?? "",
            address: customer.address ?? "",
            notes: customer.notes ?? "",
          }}
        />
        <div className="space-y-6">
          <section className="card">
            <h2 className="border-b border-slate-100 p-4 font-semibold">Compras</h2>
            {customer.sales.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">Todavía no compró.</p>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm">
                {customer.sales.map((s) => (
                  <li key={s.id}>
                    <Link href={`/admin/ventas/${s.id}`} className="flex justify-between gap-3 p-4 hover:bg-slate-50">
                      <span>{vehicleTitle(s.vehicle)} {s.vehicle.year}<span className="block text-xs text-slate-500">{formatDate(s.date)}</span></span>
                      <strong>{formatPrice(s.price, s.currency)}</strong>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="card">
            <h2 className="border-b border-slate-100 p-4 font-semibold">Consultas</h2>
            {customer.leads.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">Sin consultas vinculadas.</p>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm">
                {customer.leads.map((l) => (
                  <li key={l.id}>
                    <Link href={`/admin/consultas/${l.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50">
                      <span>
                        {l.vehicle ? `${vehicleTitle(l.vehicle)} ${l.vehicle.year}` : "Consulta general"}
                        <span className="block text-xs text-slate-500">{formatDate(l.createdAt)}</span>
                      </span>
                      <span className="flex gap-1"><LeadTypeBadge type={l.type} /><LeadStatusBadge status={l.status} /></span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          {user.role === "ADMIN" && (
            <ActionButton
              action={deleteCustomer.bind(null, customer.id)}
              confirmText="¿Eliminar este cliente? Sus consultas quedan sin cliente vinculado."
              className="text-sm text-slate-500 underline hover:text-brand-600"
            >
              Eliminar cliente
            </ActionButton>
          )}
        </div>
      </div>
    </>
  );
}
