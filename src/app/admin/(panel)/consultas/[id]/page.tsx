import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deleteLead, linkLeadToCustomer } from "@/app/admin/actions/leads";
import { ActionButton } from "@/components/admin/ActionButton";
import { LeadStatusBadge, LeadTypeBadge } from "@/components/admin/Badges";
import { LeadUpdateForm } from "@/components/admin/LeadForms";
import { PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import { requireUser } from "@/lib/auth";
import { LEAD_SOURCES, label } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatDateTime, formatPrice, vehicleTitle, whatsappLink } from "@/lib/format";

export const metadata: Metadata = { title: "Consulta" };

export default function LeadPage({ params }: PageProps<"/admin/consultas/[id]">) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <LeadDetail params={params} />
    </Suspense>
  );
}

async function LeadDetail({ params }: Pick<PageProps<"/admin/consultas/[id]">, "params">) {
  const user = await requireUser();
  const { id } = await params;
  const [lead, users] = await Promise.all([
    db.lead.findUnique({
      where: { id },
      include: {
        vehicle: { select: { id: true, slug: true, brand: true, model: true, version: true, year: true, price: true, currency: true, status: true } },
        customer: { select: { id: true, name: true } },
      },
    }),
    db.user.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!lead) notFound();

  const greeting = `Hola ${lead.name.split(" ")[0]}, te escribo de Automotores Laureano por tu consulta${
    lead.vehicle ? ` sobre el ${vehicleTitle(lead.vehicle)} ${lead.vehicle.year}` : ""
  }.`;
  const saleHref = `/admin/ventas/nueva?${new URLSearchParams({
    ...(lead.vehicle && lead.vehicle.status !== "VENDIDO" && { vehiculo: lead.vehicle.id }),
    ...(lead.customer && { cliente: lead.customer.id }),
  })}`;

  return (
    <>
      <PageHeader title={lead.name}>
        <a href={whatsappLink(lead.phone, greeting)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">WhatsApp</a>
        <a href={`tel:${lead.phone}`} className="btn-outline">Llamar</a>
        <Link href={saleHref} className="btn-dark">Registrar venta</Link>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="card space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <LeadTypeBadge type={lead.type} />
              <LeadStatusBadge status={lead.status} />
              <span className="text-sm text-slate-500">
                {formatDateTime(lead.createdAt)} · vía {label(LEAD_SOURCES, lead.source)}
              </span>
            </div>
            {lead.message && <p className="whitespace-pre-line text-slate-800">{lead.message}</p>}
            {lead.preferredDate && (
              <p className="rounded-lg bg-violet-50 p-3 text-sm text-violet-900">
                <strong>Horario preferido para el test drive:</strong> {lead.preferredDate}
              </p>
            )}
          </section>
          <LeadUpdateForm
            leadId={lead.id}
            users={users.map((u) => [u.id, u.name])}
            defaults={{ status: lead.status, assignedToId: lead.assignedToId ?? "", notes: lead.notes ?? "" }}
          />
        </div>

        <aside className="space-y-6">
          <section className="card space-y-2 p-5 text-sm">
            <h2 className="font-semibold">Contacto</h2>
            <p>{lead.name}</p>
            <p>{lead.phone}</p>
            {lead.email && <p><a href={`mailto:${lead.email}`} className="text-brand-600 hover:underline">{lead.email}</a></p>}
            <div className="border-t border-slate-100 pt-3">
              {lead.customer ? (
                <Link href={`/admin/clientes/${lead.customer.id}`} className="font-semibold text-brand-600 hover:underline">
                  Ver ficha de cliente →
                </Link>
              ) : (
                <ActionButton action={linkLeadToCustomer.bind(null, lead.id)} className="btn-outline w-full" pendingText="Creando…">
                  Crear ficha de cliente
                </ActionButton>
              )}
            </div>
          </section>

          <section className="card space-y-2 p-5 text-sm">
            <h2 className="font-semibold">Vehículo de interés</h2>
            {lead.vehicle ? (
              <>
                <Link href={`/admin/vehiculos/${lead.vehicle.id}`} className="block font-medium hover:text-brand-600">
                  {vehicleTitle(lead.vehicle)} {lead.vehicle.year}
                </Link>
                <p>{formatPrice(lead.vehicle.price, lead.vehicle.currency)}</p>
                {lead.vehicle.status === "VENDIDO" && <p className="text-amber-700">Este vehículo ya fue vendido.</p>}
              </>
            ) : (
              <p className="text-slate-500">Consulta general.</p>
            )}
          </section>

          {user.role === "ADMIN" && (
            <ActionButton
              action={deleteLead.bind(null, lead.id)}
              confirmText="¿Eliminar esta consulta? No se puede deshacer."
              className="text-sm text-slate-500 underline hover:text-brand-600"
            >
              Eliminar consulta
            </ActionButton>
          )}
        </aside>
      </div>
    </>
  );
}
