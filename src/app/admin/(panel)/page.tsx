import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import { CarPlaceholder } from "@/components/site/CarPlaceholder";
import { StatusBadge } from "@/components/site/StatusBadge";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice, imageUrl, vehicleTitle } from "@/lib/format";

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
  const [byStatus, unpublished, latest] = await Promise.all([
    db.vehicle.groupBy({ by: ["status"], _count: true }),
    db.vehicle.count({ where: { published: false, status: { not: "VENDIDO" } } }),
    db.vehicle.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
  ]);
  const count = (status: string) => byStatus.find((s) => s.status === status)?._count ?? 0;

  const stats = [
    { label: "Disponibles", value: count("DISPONIBLE"), href: "/admin/vehiculos?estado=DISPONIBLE" },
    { label: "Reservados", value: count("RESERVADO"), href: "/admin/vehiculos?estado=RESERVADO" },
    { label: "Vendidos", value: count("VENDIDO"), href: "/admin/vehiculos?estado=VENDIDO" },
    { label: "Sin publicar", value: unpublished, href: "/admin/vehiculos?publicado=no" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5 hover:shadow-md">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="text-3xl font-bold">{s.value}</p>
          </Link>
        ))}
      </div>
      <section className="card">
        <h2 className="border-b border-slate-100 p-4 font-semibold">Últimos movimientos</h2>
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
