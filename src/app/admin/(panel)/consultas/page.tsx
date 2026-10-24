import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { markLeadContacted } from "@/app/admin/actions/leads";
import { ActionButton } from "@/components/admin/ActionButton";
import { LeadStatusBadge, LeadTypeBadge } from "@/components/admin/Badges";
import { PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import type { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth";
import { LEAD_SOURCES, label } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatDateTime, vehicleTitle } from "@/lib/format";

export const metadata: Metadata = { title: "Consultas" };

const VIEWS = {
  abiertas: { label: "Abiertas", where: { status: { in: ["NUEVO", "CONTACTADO"] } } },
  nuevas: { label: "Nuevas", where: { status: "NUEVO" } },
  cerradas: { label: "Cerradas", where: { status: "CERRADO" } },
  descartadas: { label: "Descartadas", where: { status: "DESCARTADO" } },
  todas: { label: "Todas", where: {} },
} satisfies Record<string, { label: string; where: Prisma.LeadWhereInput }>;

type View = keyof typeof VIEWS;

export default function LeadsPage({ searchParams }: PageProps<"/admin/consultas">) {
  return (
    <>
      <PageHeader title="Consultas">
        <Link href="/admin/consultas/nueva" className="btn-primary">+ Cargar consulta</Link>
      </PageHeader>
      <Suspense fallback={<PanelSkeleton />}>
        <LeadsInbox searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function LeadsInbox({ searchParams }: Pick<PageProps<"/admin/consultas">, "searchParams">) {
  const user = await requireUser();
  const params = await searchParams;
  const view: View = typeof params.ver === "string" && params.ver in VIEWS ? (params.ver as View) : "abiertas";
  const mine = params.mias === "1";

  const leads = await db.lead.findMany({
    where: { ...VIEWS[view].where, ...(mine && { assignedToId: user.id }) },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      vehicle: { select: { id: true, brand: true, model: true, version: true, year: true } },
      assignedTo: { select: { name: true } },
    },
  });

  const href = (next: { ver?: View; mias?: boolean }) => {
    const q = new URLSearchParams();
    const v = next.ver ?? view;
    if (v !== "abiertas") q.set("ver", v);
    if (next.mias ?? mine) q.set("mias", "1");
    const s = q.toString();
    return `/admin/consultas${s ? `?${s}` : ""}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-1 rounded-lg bg-white p-1 text-sm shadow-sm">
          {(Object.keys(VIEWS) as View[]).map((key) => (
            <Link
              key={key}
              href={href({ ver: key })}
              className={`rounded-md px-3 py-1.5 ${key === view ? "bg-ink-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {VIEWS[key].label}
            </Link>
          ))}
        </nav>
        <Link href={href({ mias: !mine })} className={`text-sm font-medium ${mine ? "text-brand-600" : "text-slate-600"}`}>
          {mine ? "✓ Solo mis consultas" : "Ver solo mis consultas"}
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase">
            <tr>
              <th className="p-3">Fecha</th>
              <th className="p-3">Contacto</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Vehículo</th>
              <th className="p-3">Asignada a</th>
              <th className="p-3">Estado</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr key={lead.id} className={lead.status === "NUEVO" ? "bg-brand-50/40" : "hover:bg-slate-50"}>
                <td className="p-3 whitespace-nowrap text-slate-600">
                  {formatDateTime(lead.createdAt)}
                  <span className="block text-xs text-slate-400">{label(LEAD_SOURCES, lead.source)}</span>
                </td>
                <td className="p-3">
                  <Link href={`/admin/consultas/${lead.id}`} className="font-medium hover:text-brand-600">{lead.name}</Link>
                  <span className="block text-xs text-slate-500">{lead.phone}</span>
                </td>
                <td className="p-3"><LeadTypeBadge type={lead.type} /></td>
                <td className="p-3">
                  {lead.vehicle ? `${vehicleTitle(lead.vehicle)} ${lead.vehicle.year}` : <span className="text-slate-400">—</span>}
                </td>
                <td className="p-3">{lead.assignedTo?.name ?? <span className="text-slate-400">Sin asignar</span>}</td>
                <td className="p-3"><LeadStatusBadge status={lead.status} /></td>
                <td className="p-3 text-right whitespace-nowrap">
                  {lead.status === "NUEVO" && (
                    <ActionButton action={markLeadContacted.bind(null, lead.id)} className="mr-3 text-xs font-semibold text-sky-700 hover:underline">
                      Marcar contactada
                    </ActionButton>
                  )}
                  <Link href={`/admin/consultas/${lead.id}`} className="font-semibold text-brand-600 hover:underline">Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && <p className="p-6 text-center text-slate-500">No hay consultas en esta vista.</p>}
      </div>
    </div>
  );
}
