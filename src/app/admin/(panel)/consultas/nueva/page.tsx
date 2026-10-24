import type { Metadata } from "next";
import { Suspense } from "react";
import { NewLeadForm } from "@/components/admin/LeadForms";
import { PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { vehicleTitle } from "@/lib/format";

export const metadata: Metadata = { title: "Cargar consulta" };

export default function NewLeadPage({ searchParams }: PageProps<"/admin/consultas/nueva">) {
  return (
    <>
      <PageHeader title="Cargar consulta" />
      <p className="mb-4 text-sm text-slate-600">Para consultas que llegan por teléfono, WhatsApp o en el salón.</p>
      <Suspense fallback={<PanelSkeleton />}>
        <NewLead searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function NewLead({ searchParams }: Pick<PageProps<"/admin/consultas/nueva">, "searchParams">) {
  const user = await requireUser();
  const { vehiculo } = await searchParams;
  const [vehicles, users] = await Promise.all([
    db.vehicle.findMany({
      where: { status: { not: "VENDIDO" } },
      orderBy: [{ brand: "asc" }, { model: "asc" }],
      select: { id: true, brand: true, model: true, version: true, year: true },
    }),
    db.user.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return (
    <NewLeadForm
      vehicles={vehicles.map((v) => [v.id, `${vehicleTitle(v)} ${v.year}`])}
      users={users.map((u) => [u.id, u.name])}
      defaultVehicleId={typeof vehiculo === "string" ? vehiculo : undefined}
      currentUserId={user.id}
    />
  );
}
