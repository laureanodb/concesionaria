"use client";

import { useTransition } from "react";
import { deleteVehicle } from "@/app/admin/actions/vehicles";

export function DeleteVehicleButton({ vehicleId }: { vehicleId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("¿Eliminar este vehículo y todas sus fotos? Esta acción no se puede deshacer.")) {
          startTransition(() => deleteVehicle(vehicleId));
        }
      }}
      className="btn border border-brand-200 bg-white text-brand-700 hover:bg-brand-50"
    >
      {pending ? "Eliminando…" : "Eliminar vehículo"}
    </button>
  );
}
