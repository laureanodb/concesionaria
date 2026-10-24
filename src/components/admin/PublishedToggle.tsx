"use client";

import { useOptimistic, useTransition } from "react";
import { togglePublished } from "@/app/admin/actions/vehicles";

export function PublishedToggle({ vehicleId, published }: { vehicleId: string; published: boolean }) {
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useOptimistic(published);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label="Publicado en la web"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          setValue(!value);
          await togglePublished(vehicleId);
        })
      }
      className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-emerald-500" : "bg-slate-300"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${value ? "left-5.5" : "left-0.5"}`} />
    </button>
  );
}
