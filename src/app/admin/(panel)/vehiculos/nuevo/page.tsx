import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { EMPTY_VEHICLE, VehicleForm } from "@/components/admin/VehicleForm";

export const metadata: Metadata = { title: "Cargar vehículo" };

export default function NewVehiclePage() {
  return (
    <>
      <PageHeader title="Cargar vehículo" />
      <p className="mb-4 text-sm text-slate-600">Completá los datos. En el paso siguiente vas a poder subir las fotos.</p>
      <VehicleForm vehicleId={null} defaults={EMPTY_VEHICLE} />
    </>
  );
}
