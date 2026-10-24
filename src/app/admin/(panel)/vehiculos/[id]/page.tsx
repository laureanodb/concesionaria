import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeleteVehicleButton } from "@/components/admin/DeleteVehicleButton";
import { ImageManager } from "@/components/admin/ImageManager";
import { PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatDateTime, formatPrice, imageUrl, vehicleTitle } from "@/lib/format";
import { LeadStatusBadge, LeadTypeBadge } from "@/components/admin/Badges";

export const metadata: Metadata = { title: "Editar vehículo" };

export default function EditVehiclePage({ params, searchParams }: PageProps<"/admin/vehiculos/[id]">) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <EditVehicle params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function EditVehicle({ params, searchParams }: PageProps<"/admin/vehiculos/[id]">) {
  await requireUser();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const vehicle = await db.vehicle.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      leads: { orderBy: { createdAt: "desc" }, take: 20 },
      sales: { orderBy: { date: "desc" }, take: 1, include: { customer: { select: { id: true, name: true } } } },
    },
  });
  if (!vehicle) notFound();
  const sale = vehicle.sales[0];

  return (
    <>
      <PageHeader title={`${vehicleTitle(vehicle)} ${vehicle.year}`}>
        {vehicle.published && vehicle.status !== "VENDIDO" && (
          <Link href={`/autos/${vehicle.slug}`} target="_blank" className="btn-outline">Ver en la web ↗</Link>
        )}
        {vehicle.status !== "VENDIDO" && (
          <Link href={`/admin/ventas/nueva?vehiculo=${vehicle.id}`} className="btn-dark">Registrar venta</Link>
        )}
        <DeleteVehicleButton vehicleId={vehicle.id} />
      </PageHeader>
      {sale && (
        <p className="mb-4 rounded-lg bg-slate-200/70 p-3 text-sm">
          Vendido el {formatDate(sale.date)} a{" "}
          <Link href={`/admin/clientes/${sale.customer.id}`} className="font-semibold hover:underline">{sale.customer.name}</Link>{" "}
          por {formatPrice(sale.price, sale.currency)}.{" "}
          <Link href={`/admin/ventas/${sale.id}`} className="font-semibold text-brand-600 hover:underline">Ver venta</Link>
        </p>
      )}
      {query.nuevo && (
        <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          ¡Vehículo creado! Ahora subí las fotos.
        </p>
      )}
      <div className="space-y-6">
        <ImageManager
          vehicleId={vehicle.id}
          images={vehicle.images.map((img) => ({ id: img.id, url: imageUrl(img.path) }))}
        />
        <VehicleForm
          vehicleId={vehicle.id}
          defaults={{
            brand: vehicle.brand,
            model: vehicle.model,
            version: vehicle.version ?? "",
            year: String(vehicle.year),
            km: String(vehicle.km),
            price: String(vehicle.price),
            currency: vehicle.currency,
            condition: vehicle.condition,
            fuel: vehicle.fuel,
            transmission: vehicle.transmission,
            bodyType: vehicle.bodyType,
            color: vehicle.color ?? "",
            doors: vehicle.doors ? String(vehicle.doors) : "",
            description: vehicle.description ?? "",
            status: vehicle.status,
            published: vehicle.published,
            featured: vehicle.featured,
          }}
        />
        <section className="card">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <h2 className="font-semibold">Consultas por este vehículo ({vehicle.leads.length})</h2>
            <Link href={`/admin/consultas/nueva?vehiculo=${vehicle.id}`} className="text-sm font-semibold text-brand-600 hover:underline">+ Cargar consulta</Link>
          </div>
          {vehicle.leads.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Todavía no hay consultas.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {vehicle.leads.map((l) => (
                <li key={l.id}>
                  <Link href={`/admin/consultas/${l.id}`} className="flex flex-wrap items-center gap-3 p-3 hover:bg-slate-50">
                    <span className="flex-1 font-medium">{l.name} <span className="font-normal text-slate-500">· {l.phone}</span></span>
                    <LeadTypeBadge type={l.type} />
                    <LeadStatusBadge status={l.status} />
                    <span className="text-xs text-slate-500">{formatDateTime(l.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
