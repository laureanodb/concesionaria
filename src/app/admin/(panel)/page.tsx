import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import { CarPlaceholder } from "@/components/site/CarPlaceholder";
import { LeadTypeBadge } from "@/components/admin/Badges";
import { StatusBadge } from "@/components/site/StatusBadge";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime, formatPrice, imageUrl, isoDateInArgentina, monthRange, vehicleTitle } from "@/lib/format";

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Resumen">
        <Link href="/admin/vehiculos/nuevo" className="btn-primary">+ Cargar vehículo</Link>
      </PageHeader>
      <Suspense fallback={<PanelSkeleton />}>
        <Dashboard />
      </Suspense>
    </>
  );
}

async function Dashboard() {
  await requireUser();
  const month = monthRange(isoDateInArgentina(new Date()).slice(0, 7))!;
  const [byStatus, unpublished, latest, newLeads, openLeads, salesThisMonth, recentLeads] = await Promise.all([
    db.vehicle.groupBy({ by: ["status"], _count: true }),
    db.vehicle.count({ where: { published: false, status: { not: "VENDIDO" } } }),
    db.vehicle.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    db.lead.count({ where: { status: "NUEVO" } }),
    db.lead.count({ where: { status: { in: ["NUEVO", "CONTACTADO"] } } }),
    db.sale.count({ where: { date: { gte: month.from, lt: month.to } } }),
    db.lead.findMany({
      where: { status: { in: ["NUEVO", "CONTACTADO"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { vehicle: { select: { brand: true, model: true, year: true } } },
    }),
  ]);
  const count = (status: string) => byStatus.find((s) => s.status === status)?._count ?? 0;

  const commercial = [
    { label: "Consultas nuevas", value: newLeads, href: "/admin/consultas?ver=nuevas", highlight: newLeads > 0 },
    { label: "Consultas abiertas", value: openLeads, href: "/admin/consultas", highlight: false },
    { label: "Ventas del mes", value: salesThisMonth, href: "/admin/ventas", highlight: false },
  ];

  const stats = [
    { label: "Disponibles", value: count("DISPONIBLE"), href: "/admin/vehiculos?estado=DISPONIBLE" },
    { label: "Reservados", value: count("RESERVADO"), href: "/admin/vehiculos?estado=RESERVADO" },
    { label: "Vendidos", value: count("VENDIDO"), href: "/admin/vehiculos?estado=VENDIDO" },
    { label: "Sin publicar", value: unpublished, href: "/admin/vehiculos?publicado=no" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {commercial.map((s) => (
          <Link key={s.label} href={s.href} className={`card p-5 hover:shadow-md ${s.highlight ? "border-brand-500 bg-brand-50" : ""}`}>
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className={`text-3xl font-bold ${s.highlight ? "text-brand-700" : ""}`}>{s.value}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5 hover:shadow-md">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="text-3xl font-bold">{s.value}</p>
          </Link>
        ))}
      </div>
      <section className="card">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h2 className="font-semibold">Consultas para atender</h2>
          <Link href="/admin/consultas" className="text-sm font-semibold text-brand-600 hover:underline">Ver todas</Link>
        </div>
        {recentLeads.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No hay consultas pendientes. 🎉</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentLeads.map((l) => (
              <li key={l.id}>
                <Link href={`/admin/consultas/${l.id}`} className="flex flex-wrap items-center gap-3 p-3 text-sm hover:bg-slate-50">
                  <span className="min-w-0 flex-1">
                    <span className="font-medium">{l.name}</span>
                    {l.status === "NUEVO" && <span className="ml-2 rounded-full bg-brand-600 px-1.5 text-xs text-white">Nueva</span>}
                    <span className="block truncate text-slate-500">
                      {l.vehicle ? `${l.vehicle.brand} ${l.vehicle.model} ${l.vehicle.year}` : "Consulta general"}
                    </span>
                  </span>
                  <LeadTypeBadge type={l.type} />
                  <span className="text-xs text-slate-500">{formatDateTime(l.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="card">
        <h2 className="border-b border-slate-100 p-4 font-semibold">Últimos movimientos de stock</h2>
        {latest.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">
            Todavía no cargaste vehículos. <Link href="/admin/vehiculos/nuevo" className="font-semibold text-brand-600">Cargá el primero</Link>.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {latest.map((v) => (
              <li key={v.id}>
                <Link href={`/admin/vehiculos/${v.id}`} className="flex items-center gap-4 p-3 hover:bg-slate-50">
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded">
                    {v.images[0] ? (
                      <Image src={imageUrl(v.images[0].path)} alt="" fill sizes="64px" className="object-cover" />
                    ) : (
                      <CarPlaceholder className="h-full w-full" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{vehicleTitle(v)} {v.year}</p>
                    <p className="text-sm text-slate-500">{formatPrice(v.price, v.currency)}</p>
                  </div>
                  <StatusBadge status={v.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
