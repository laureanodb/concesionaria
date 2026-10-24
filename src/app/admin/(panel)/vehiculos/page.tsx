import type { Metadata } from "next";
import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import { PublishedToggle } from "@/components/admin/PublishedToggle";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { CarPlaceholder } from "@/components/site/CarPlaceholder";
import type { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth";
import { CONDITIONS, STATUSES, label } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatKm, formatPrice, imageUrl, vehicleTitle } from "@/lib/format";

export const metadata: Metadata = { title: "Stock" };

export default function StockPage({ searchParams }: PageProps<"/admin/vehiculos">) {
  return (
    <>
      <PageHeader title="Stock">
        <Link href="/admin/vehiculos/nuevo" className="btn-primary">+ Cargar vehículo</Link>
      </PageHeader>
      <Suspense fallback={<PanelSkeleton />}>
        <StockTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function StockTable({ searchParams }: Pick<PageProps<"/admin/vehiculos">, "searchParams">) {
  await requireUser();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const estado = typeof params.estado === "string" && params.estado in STATUSES ? params.estado : "";
  const unpublished = params.publicado === "no";

  const where: Prisma.VehicleWhereInput = {
    ...(estado && { status: estado }),
    ...(unpublished && { published: false }),
    ...(q && {
      OR: [{ brand: { contains: q, mode: "insensitive" } }, { model: { contains: q, mode: "insensitive" } }, { version: { contains: q, mode: "insensitive" } }],
    }),
  };
  const vehicles = await db.vehicle.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, _count: { select: { images: true } } },
  });

  return (
    <div className="space-y-4">
      <Form action="/admin/vehiculos" className="card flex flex-wrap items-end gap-3 p-3">
        <div className="min-w-48 flex-1">
          <label htmlFor="q" className="field-label">Buscar</label>
          <input id="q" name="q" defaultValue={q} placeholder="Marca, modelo o versión" className="input" />
        </div>
        <div>
          <label htmlFor="estado" className="field-label">Estado</label>
          <select id="estado" name="estado" defaultValue={estado} className="input">
            <option value="">Todos</option>
            {Object.entries(STATUSES).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <button className="btn-dark">Filtrar</button>
      </Form>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase">
            <tr>
              <th className="p-3">Vehículo</th>
              <th className="p-3">Año / Km</th>
              <th className="p-3">Precio</th>
              <th className="p-3">Estado</th>
              <th className="p-3">En la web</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vehicles.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded">
                      {v.images[0] ? (
                        <Image src={imageUrl(v.images[0].path)} alt="" fill sizes="64px" className="object-cover" />
                      ) : (
                        <CarPlaceholder className="h-full w-full" />
                      )}
                    </div>
                    <div>
                      <Link href={`/admin/vehiculos/${v.id}`} className="font-medium hover:text-brand-600">
                        {vehicleTitle(v)}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {label(CONDITIONS, v.condition)} · {v._count.images} fotos
                        {v.featured && " · ★ Destacado"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-3">{v.year}<br /><span className="text-slate-500">{formatKm(v.km)}</span></td>
                <td className="p-3 font-medium">{formatPrice(v.price, v.currency)}</td>
                <td className="p-3"><StatusSelect key={v.status} vehicleId={v.id} status={v.status} /></td>
                <td className="p-3"><PublishedToggle vehicleId={v.id} published={v.published} /></td>
                <td className="p-3 text-right">
                  <Link href={`/admin/vehiculos/${v.id}`} className="font-semibold text-brand-600 hover:underline">Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vehicles.length === 0 && <p className="p-6 text-center text-slate-500">No hay vehículos con esos filtros.</p>}
      </div>
    </div>
  );
}
