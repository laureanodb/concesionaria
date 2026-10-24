"use client";

import { useTransition } from "react";
import { setVehicleStatus } from "@/app/admin/actions/vehicles";
import { STATUSES } from "@/lib/constants";

export function StatusSelect({ vehicleId, status }: { vehicleId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      aria-label="Estado"
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value;
        startTransition(() => setVehicleStatus(vehicleId, value));
      }}
      className="input w-auto py-1 text-xs"
    >
      {Object.entries(STATUSES).map(([k, v]) => (
        <option key={k} value={k}>{v}</option>
      ))}
    </select>
  );
}
