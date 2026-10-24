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
import { imageUrl, vehicleTitle } from "@/lib/format";

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
    include: { images: { orderBy: { position: "asc" } } },
  });
  if (!vehicle) notFound();

  return (
    <>
      <PageHeader title={`${vehicleTitle(vehicle)} ${vehicle.year}`}>
        {vehicle.published && vehicle.status !== "VENDIDO" && (
          <Link href={`/autos/${vehicle.slug}`} target="_blank" className="btn-outline">Ver en la web ↗</Link>
        )}
        <DeleteVehicleButton vehicleId={vehicle.id} />
      </PageHeader>
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
      </div>
    </>
  );
}
